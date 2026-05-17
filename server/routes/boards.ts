import { Router } from 'express'
import { readDb, writeDb } from '../db.js'

const router = Router()

router.get('/:profileId', (req, res) => {
  const db = readDb()
  const board = db.boards[req.params.profileId]
  if (!board) return res.json({ columns: {}, tasks: {}, columnOrder: [] })
  res.json(board)
})

router.put('/:profileId', (req, res) => {
  const db = readDb()
  db.boards[req.params.profileId] = req.body
  writeDb(db)
  res.json({ ok: true })
})

export default router
