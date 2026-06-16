import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import PocketBase from 'pocketbase'
import { findKnownService } from '../src/data/serviceCatalog.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const datasetsPath = path.join(root, 'pocketbase', 'seeders', 'expenseDatasets.json')

const args = new Set(process.argv.slice(2))
const argValue = (name, fallback) => {
  const prefix = `${name}=`
  const match = process.argv.slice(2).find((item) => item.startsWith(prefix))
  return match ? match.slice(prefix.length) : fallback
}

const url = argValue('--url', process.env.POCKETBASE_URL || 'http://127.0.0.1:8090')
const collection = argValue('--collection', process.env.POCKETBASE_COLLECTION || 'expenses')
const datasetName = argValue('--dataset', process.env.POCKETBASE_SEED_DATASET || 'all')
const reset = args.has('--reset')
const list = args.has('--list')
const dryRun = args.has('--dry-run')

const now = () => new Date().toISOString()

const readDatasets = async () => JSON.parse(await fs.readFile(datasetsPath, 'utf8'))

const getDatasetNames = (datasets) => Object.keys(datasets)

const resolveDataset = (datasets, name) => {
  if (name === 'all') {
    return {
      label: 'all',
      records: getDatasetNames(datasets).flatMap((dataset) => datasets[dataset])
    }
  }

  const records = datasets[name]
  if (!records) return null

  return {
    label: name,
    records
  }
}

const serializeExpense = (expense) => ({
  name: expense.name,
  category: expense.category,
  amount: Number(expense.amount) || 0,
  currency: expense.currency || 'CAD',
  url: expense.url || '',
  icon: expense.icon || findKnownService(expense.name)?.icon || '',
  note: expense.note || '',
  includesTax: expense.includesTax !== false,
  taxRate: Number(expense.taxRate) || 0,
  frequency: expense.frequency || 'monthly',
  customTimesPerYear: expense.customTimesPerYear || null,
  startDate: expense.startDate || null,
  datePattern: expense.datePattern || null,
  active: expense.active !== false,
  createdAt: expense.createdAt || now(),
  updatedAt: now()
})

const main = async () => {
  const datasets = await readDatasets()

  if (list) {
    console.log(['all', ...getDatasetNames(datasets)].join('\n'))
    return
  }

  const selected = resolveDataset(datasets, datasetName)
  if (!selected) {
    throw new Error(`Unknown dataset "${datasetName}". Run with --list to see available datasets.`)
  }

  if (dryRun) {
    console.log(`Would seed ${selected.records.length} "${selected.label}" records into ${url}/${collection}.`)
    return
  }

  const client = new PocketBase(url)

  if (reset) {
    const existing = await client.collection(collection).getFullList({ fields: 'id' })
    await Promise.all(existing.map((record) => client.collection(collection).delete(record.id)))
  }

  for (const expense of selected.records) {
    await client.collection(collection).create(serializeExpense(expense))
  }

  console.log(`Seeded ${selected.records.length} "${selected.label}" records into ${url}/${collection}.`)
}

main().catch((error) => {
  console.error(error?.message || error)
  process.exitCode = 1
})
