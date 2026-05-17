import { Router } from 'express'
import { readDb, writeDb } from '../db.js'

const router = Router()

// PATCH /api/settings — merge provided keys into db top-level settings
router.patch('/', (req, res) => {
  const db = readDb()
  const allowed = ['activeProfileId', 'profileOrder'] as const
  for (const key of allowed) {
    if (key in req.body) (db as Record<string, unknown>)[key] = req.body[key]
  }
  writeDb(db)
  res.json({ ok: true })
})

export default router
