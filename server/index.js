import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const dbPath = path.join(process.cwd(), 'server', 'subfolio.db')
const db = new Database(dbPath)

db.prepare(
  `CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`
).run()

app.get('/expenses', (req, res) => {
  const rows = db
    .prepare('SELECT id, name, category, amount, frequency, dueDate, createdAt FROM expenses ORDER BY dueDate ASC')
    .all()

  res.json(rows)
})

app.post('/expenses', (req, res) => {
  const { name, category, amount, frequency, dueDate } = req.body

  if (!name || !category || !amount || !frequency || !dueDate) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const result = db
    .prepare(
      'INSERT INTO expenses (name, category, amount, frequency, dueDate) VALUES (?, ?, ?, ?, ?)'
    )
    .run(name, category, amount, frequency, dueDate)

  const created = db
    .prepare('SELECT id, name, category, amount, frequency, dueDate, createdAt FROM expenses WHERE id = ?')
    .get(result.lastInsertRowid)

  return res.status(201).json(created)
})

app.put('/expenses/:id', (req, res) => {
  const { id } = req.params
  const { name, category, amount, frequency, dueDate } = req.body

  if (!name || !category || !amount || !frequency || !dueDate) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const result = db
    .prepare(
      'UPDATE expenses SET name = ?, category = ?, amount = ?, frequency = ?, dueDate = ? WHERE id = ?'
    )
    .run(name, category, amount, frequency, dueDate, id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' })
  }

  const updated = db
    .prepare('SELECT id, name, category, amount, frequency, dueDate, createdAt FROM expenses WHERE id = ?')
    .get(id)

  return res.json(updated)
})

app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM expenses WHERE id = ?').run(id)
  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`Subfolio API listening on port ${PORT}`)
})
