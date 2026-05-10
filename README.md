# LFCS Practice Dashboard

LFCS prep dashboard with authenticated progress persistence.

## Features
- Email/password login (no public registration).
- Server-side sessions (`express-session`) with SQLite-backed session store.
- Session cookie settings: `HttpOnly`, `Secure` in production, `SameSite=Lax`.
- Password hashing with Argon2id.
- Per-user progress persistence in SQLite.
- CSRF protection (`csurf`) and login rate limiting.
- Security headers via Helmet.
- Health endpoint: `GET /health`.

## Setup
1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create admin user:
   ```bash
   npm run create-admin-user
   ```
4. Run in development:
   ```bash
   npm run dev
   ```

## Auth Routes
- `GET /api/csrf-token`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/current-user`

## Progress Routes (auth required)
- `GET /api/progress`
- `POST /api/progress`

## Deployment Notes (AWS Lightsail + Nginx)
- Use HTTPS at Nginx and forward to Node app.
- Set `NODE_ENV=production` and strong `SESSION_SECRET`.
- Keep `APP_ORIGIN` set to your HTTPS app URL.
- Run `npm run build` and `npm run start`.
- Persist `./data` directory (SQLite DB + session DB) on durable disk.
