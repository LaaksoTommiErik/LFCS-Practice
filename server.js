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
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import client from 'prom-client'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, 'dist')
const dataPath = path.join(__dirname, 'data')

fs.mkdirSync(dataPath, { recursive: true })

const {
  getUserByEmail,
  getUserById,
  initDb,
  upsertProgress,
  loadProgress,
  verifyPassword,
  checkDatabase,
} = await import('./src/server/db.js')

initDb()

const app = express()
const SQLiteStore = SQLiteStoreFactory(session)
const port = Number(process.env.PORT || 3000)

app.set('trust proxy', 1)

/**
 * Prometheus metrics
 */

const register = new client.Registry()

client.collectDefaultMetrics({
  register,
  prefix: 'lfcs_dashboard_',
})

const httpRequestDuration = new client.Histogram({
  name: 'lfcs_dashboard_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
})

const httpRequestsTotal = new client.Counter({
  name: 'lfcs_dashboard_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestsTotal)

function normalizeRoute(req) {
  const requestPath = req.path || req.url || 'unknown'

  if (requestPath === '/') return '/'
  if (requestPath === '/healthz') return '/healthz'
  if (requestPath === '/readyz') return '/readyz'
  if (requestPath === '/metrics') return '/metrics'
  if (requestPath === '/health') return '/health'
  if (requestPath.startsWith('/api/csrf-token')) return '/api/csrf-token'
  if (requestPath.startsWith('/api/login')) return '/api/login'
  if (requestPath.startsWith('/api/logout')) return '/api/logout'
  if (requestPath.startsWith('/api/current-user')) return '/api/current-user'
  if (requestPath.startsWith('/api/progress')) return '/api/progress'
  if (requestPath.startsWith('/assets/')) return '/assets/*'

  return 'other'
}

/**
 * Structured request logging
 */

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint()
  const requestId = req.headers['x-request-id'] || randomUUID()

  res.setHeader('X-Request-Id', requestId)

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    const logEntry = {
      ts: new Date().toISOString(),
      level:
        res.statusCode >= 500
          ? 'error'
          : res.statusCode >= 400
            ? 'warn'
            : 'info',
      event: 'http_request',
      request_id: requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration_ms: Number(durationMs.toFixed(2)),
      ip: req.ip,
      user_agent: req.get('user-agent') || '',
    }

    console.log(JSON.stringify(logEntry))
  })

  next()
})

/**
 * HTTP metrics middleware
 */

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer()

  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: normalizeRoute(req),
      status_code: String(res.statusCode),
    }

    httpRequestsTotal.inc(labels)
    end(labels)
  })

  next()
})

app.use(helmet())
app.use(cors({
  origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json({ limit: '200kb' }))

/**
 * Operational endpoints.
 * These must come before the React static fallback.
 */

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
  })
})

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

app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    })
  }
})

/**
 * Session, CSRF, auth, and API routes.
 */

app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: './data',
    }),
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
)

if (!process.env.SESSION_SECRET) {
  console.warn(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'warn',
    event: 'missing_session_secret',
    message: 'SESSION_SECRET is not set. Using development fallback.',
  }))
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

const csrfProtection = csurf({ cookie: false })

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
  })
})

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
})

app.post('/api/login', loginLimiter, csrfProtection, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' })
    }

    const user = getUserByEmail(parsed.data.email)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await verifyPassword(parsed.data.password, user.password_hash)

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    req.session.userId = user.id
    req.session.role = user.role

    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/logout', csrfProtection, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid')
    res.json({ ok: true })
  })
})

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return next()
}

app.get('/api/current-user', requireAuth, (req, res) => {
  const user = getUserById(req.session.userId)

  if (!user) {
    req.session.destroy(() => {})
    return res.status(401).json({ error: 'Unauthorized' })
  }

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
  })
})

app.get('/api/progress', requireAuth, (req, res) => {
  res.json({
    progress: loadProgress(req.session.userId),
  })
})

const progressSchema = z.object({
  taskId: z.string().min(1).max(100),
  status: z.enum(['not started', 'in progress', 'passed', 'failed']),
  evidence: z.string().max(5000).optional().default(''),
})

app.post('/api/progress', requireAuth, csrfProtection, (req, res) => {
  const parsed = progressSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  upsertProgress(req.session.userId, parsed.data)

  res.json({
    ok: true,
  })
})

app.use('/api', (_req, res) => {
  res.status(404).json({
    error: 'API route not found',
  })
})

/**
 * Error handler.
 */

app.use((error, req, res, _next) => {
  if (error.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'invalid csrf token',
    })
  }

  console.error(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'error',
    event: 'unhandled_error',
    method: req.method,
    path: req.originalUrl || req.url,
    error: error.message,
  }))

  res.status(500).json({
    error: 'Internal server error',
  })
})

/**
 * React production build serving.
 * This must stay after operational endpoints and API routes.
 */

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    event: 'server_started',
    service: 'lfcs-study-dashboard',
    port,
  }))
})