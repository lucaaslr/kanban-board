import fs from 'fs'
import path from 'path'

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'db.json')

export interface DbProfile {
  id: string
  name: string
  emoji: string
  createdAt: number
}

export interface DbBoard {
  columns: Record<string, unknown>
  tasks: Record<string, unknown>
  columnOrder: string[]
}

export interface DbData {
  profiles: Record<string, DbProfile>
  profileOrder: string[]
  activeProfileId: string | null
  boards: Record<string, DbBoard>
}

function ensureDir() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function readDb(): DbData {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DbData
  } catch {
    return { profiles: {}, profileOrder: [], activeProfileId: null, boards: {} }
  }
}

export function writeDb(data: DbData): void {
  ensureDir()
  const tmp = `${DB_PATH}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, DB_PATH)  // atomic on same filesystem
}
