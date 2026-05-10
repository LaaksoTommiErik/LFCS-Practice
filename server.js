import express from 'express'
import session from 'express-session'
import SQLiteStoreFactory from 'connect-sqlite3'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import csurf from 'csurf'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import { z } from 'zod'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getUserByEmail,
  getUserById,
  initDb,
  upsertProgress,
  loadProgress,
  verifyPassword,
  checkDatabase,
} from './src/server/db.js'

dotenv.config()
initDb()

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SQLiteStore = SQLiteStoreFactory(session)

app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: process.env.APP_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '200kb' }))

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './data' }),
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
)

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false })
const csrfProtection = csurf({ cookie: false })

app.get('/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }))

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(200) })
app.post('/api/login', loginLimiter, csrfProtection, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const user = getUserByEmail(parsed.data.email)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await verifyPassword(parsed.data.password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  req.session.userId = user.id
  req.session.role = user.role
  res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } })
})

app.post('/api/logout', csrfProtection, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' })
  return next()
}

app.get('/api/current-user', requireAuth, (req, res) => {
  const user = getUserById(req.session.userId)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ id: user.id, email: user.email, role: user.role })
})

app.get('/api/progress', requireAuth, (req, res) => {
  res.json({ progress: loadProgress(req.session.userId) })
})

const progressSchema = z.object({ taskId: z.string().min(1).max(100), status: z.enum(['not started', 'in progress', 'passed', 'failed']), evidence: z.string().max(5000).optional().default('') })
app.post('/api/progress', requireAuth, csrfProtection, (req, res) => {
  const parsed = progressSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })
  upsertProgress(req.session.userId, parsed.data)
  res.json({ ok: true })
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
}

app.get('/healthz', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'lfcs-study-dashboard',
    status: 'healthy',
  })
})

app.get('/readyz', (_req, res) => {
  try {
    checkDatabase()

    res.status(200).json({
      ok: true,
      service: 'lfcs-study-dashboard',
      status: 'ready',
      checks: {
        database: 'ok',
      },
    })
  } catch (error) {
    res.status(503).json({
      ok: false,
      service: 'lfcs-study-dashboard',
      status: 'not ready',
      checks: {
        database: 'failed',
      },
      error: error.message,
    })
  }
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => console.log(`Server listening on ${port}`))
