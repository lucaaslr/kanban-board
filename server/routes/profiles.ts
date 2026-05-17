import { Router } from 'express'
import { readDb, writeDb } from '../db.js'

const router = Router()

router.get('/', (_req, res) => {
  const db = readDb()
  res.json({
    profiles: db.profiles,
    profileOrder: db.profileOrder,
    activeProfileId: db.activeProfileId,
  })
})

router.post('/', (req, res) => {
  const { id, name, emoji, createdAt } = req.body as {
    id: string; name: string; emoji: string; createdAt: number
  }
  const db = readDb()
  db.profiles[id] = { id, name, emoji, createdAt }
  db.profileOrder.push(id)
  if (!db.activeProfileId) db.activeProfileId = id
  db.boards[id] = { columns: {}, tasks: {}, columnOrder: [] }
  writeDb(db)
  res.status(201).json(db.profiles[id])
})

router.put('/:id', (req, res) => {
  const { name, emoji } = req.body as { name: string; emoji: string }
  const db = readDb()
  if (!db.profiles[req.params.id]) return res.status(404).json({ error: 'Not found' })
  db.profiles[req.params.id] = { ...db.profiles[req.params.id], name, emoji }
  writeDb(db)
  res.json({ ok: true })
})

router.delete('/:id', (req, res) => {
  const db = readDb()
  const id = req.params.id
  if (db.profileOrder.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the last profile' })
  }
  delete db.profiles[id]
  delete db.boards[id]
  db.profileOrder = db.profileOrder.filter((pid) => pid !== id)
  if (db.activeProfileId === id) db.activeProfileId = db.profileOrder[0] ?? null
  writeDb(db)
  res.json({ ok: true })
})

export default router
