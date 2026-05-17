import dotenv from 'dotenv'
import { createUser, getUserByEmail, hashPassword, initDb } from '../src/server/db.js'

dotenv.config()
await initDb()

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_INITIAL_PASSWORD

if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD')
  process.exit(1)
}

if (await getUserByEmail(email)) {
  console.log('Admin user already exists.')
  process.exit(0)
}

const hash = await hashPassword(password)
await createUser(email, hash, 'admin')
console.log(`Admin user created: ${email}`)
