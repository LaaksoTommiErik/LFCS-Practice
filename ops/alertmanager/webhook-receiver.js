import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const port = Number(process.env.PORT || 8080)
const dataDir = process.env.DATA_DIR || '/data'
const eventFile = path.join(dataDir, 'alertmanager-webhook-events.jsonl')

fs.mkdirSync(dataDir, { recursive: true })

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', chunk => {
      body += chunk
      if (body.length > 1024 * 1024) {
        reject(new Error('request body too large'))
        req.destroy()
      }
    })

    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function readEvents() {
  if (!fs.existsSync(eventFile)) return []

  return fs.readFileSync(eventFile, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line)
      } catch {
        return { parse_error: true, raw: line }
      }
    })
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true, service: 'alert-webhook' }))
      return
    }

    if (req.method === 'GET' && req.url === '/events') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(readEvents(), null, 2))
      return
    }

    if (req.method === 'POST' && req.url === '/alertmanager') {
      const body = await readBody(req)
      const parsed = JSON.parse(body)

      const event = {
        received_at: new Date().toISOString(),
        payload: parsed,
      }

      fs.appendFileSync(eventFile, JSON.stringify(event) + '\n')
      console.log(JSON.stringify({
        event: 'alertmanager_webhook_received',
        received_at: event.received_at,
        status: parsed.status,
        alert_count: Array.isArray(parsed.alerts) ? parsed.alerts.length : 0,
        common_labels: parsed.commonLabels || {},
      }))

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: false, error: 'not found' }))
  } catch (error) {
    console.error(JSON.stringify({
      event: 'alert_webhook_error',
      error: error.message,
    }))

    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: false, error: error.message }))
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({
    event: 'alert_webhook_started',
    port,
    eventFile,
  }))
})
