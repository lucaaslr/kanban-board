import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import profilesRouter from './routes/profiles.js'
import boardsRouter from './routes/boards.js'
import settingsRouter from './routes/settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 3001)
const API_TOKEN = process.env.API_TOKEN ?? ''
const isProd = process.env.NODE_ENV === 'production'

const app = express()
app.use(express.json({ limit: '4mb' }))

// ── Auth middleware ────────────────────────────────────────────────────────

if (API_TOKEN) {
  app.use('/api', (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token !== API_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    next()
  })
}

// ── Routes ─────────────────────────────────────────────────────────────────

app.use('/api/profiles', profilesRouter)
app.use('/api/boards', boardsRouter)
app.use('/api/settings', settingsRouter)

// Lets the client detect whether auth is required without needing a token
app.get('/api/auth-config', (_req, res) => {
  res.json({ authRequired: !!API_TOKEN })
})

// ── Static (production only) ───────────────────────────────────────────────

if (isProd) {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kanban server running on http://0.0.0.0:${PORT}`)
  if (API_TOKEN) console.log('Auth: token required')
  else console.log('Auth: disabled (set API_TOKEN to enable)')
})
