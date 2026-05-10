import Database from 'better-sqlite3'
import argon2 from 'argon2'

const db = new Database('./data/app.sqlite')

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER NOT NULL,
      task_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not started',
      evidence TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, task_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
}

export async function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id })
}

export async function verifyPassword(password, hash) {
  return argon2.verify(hash, password)
}

export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
}

export function getUserById(id) {
  return db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(id)
}

export function createUser(email, passwordHash, role = 'user') {
  return db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(email.toLowerCase(), passwordHash, role)
}

export function loadProgress(userId) {
  const rows = db.prepare('SELECT task_id, status, evidence FROM progress WHERE user_id = ?').all(userId)
  return rows.reduce((acc, r) => {
    acc[r.task_id] = { status: r.status, evidence: r.evidence }
    return acc
  }, {})
}

export function upsertProgress(userId, { taskId, status, evidence }) {
  db.prepare(`
    INSERT INTO progress (user_id, task_id, status, evidence, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, task_id)
    DO UPDATE SET status=excluded.status, evidence=excluded.evidence, updated_at=CURRENT_TIMESTAMP
  `).run(userId, taskId, status, evidence || '')
}
