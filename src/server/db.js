import argon2 from 'argon2'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

const pool = new Pool({ connectionString })

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)


  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      sid TEXT PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMPTZ NOT NULL
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      task_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not started',
      evidence TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, task_id)
    );
  `)
}

export async function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id })
}

export async function verifyPassword(password, hash) {
  return argon2.verify(hash, password)
}

export async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
  return result.rows[0]
}

export async function getUserById(id) {
  const result = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [id])
  return result.rows[0]
}

export async function createUser(email, passwordHash, role = 'user') {
  return pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [email.toLowerCase(), passwordHash, role])
}

export async function loadProgress(userId) {
  const result = await pool.query('SELECT task_id, status, evidence FROM progress WHERE user_id = $1', [userId])
  return result.rows.reduce((acc, r) => {
    acc[r.task_id] = { status: r.status, evidence: r.evidence }
    return acc
  }, {})
}

export async function upsertProgress(userId, { taskId, status, evidence }) {
  await pool.query(`
    INSERT INTO progress (user_id, task_id, status, evidence, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT(user_id, task_id)
    DO UPDATE SET status=excluded.status, evidence=excluded.evidence, updated_at=NOW()
  `, [userId, taskId, status, evidence || ''])
}

export async function checkDatabase() {
  return pool.query('SELECT 1 AS ok')
}

export { pool }
