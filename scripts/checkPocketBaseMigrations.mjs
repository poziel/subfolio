import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = path.join(root, 'pocketbase', 'pb_migrations')

const expectedExpenseFields = new Map([
  ['name', 'text'],
  ['category', 'text'],
  ['amount', 'number'],
  ['currency', 'text'],
  ['url', 'text'],
  ['icon', 'text'],
  ['note', 'text'],
  ['includesTax', 'bool'],
  ['taxRate', 'number'],
  ['frequency', 'text'],
  ['customTimesPerYear', 'number'],
  ['startDate', 'text'],
  ['datePattern', 'json'],
  ['active', 'bool'],
  ['createdAt', 'text'],
  ['updatedAt', 'text']
])

class Collection {
  constructor(model = {}) {
    Object.assign(this, model)
    this.fields = createFieldsList(model.fields || [])
  }
}

class TextField {
  constructor(model = {}) {
    Object.assign(this, { type: 'text' }, model)
  }
}

const createFieldsList = (fields = []) => {
  const list = [...fields]
  list.add = (field) => {
    list.push(field)
    return field
  }
  return list
}

const createApp = () => {
  const collections = new Map()

  return {
    saved: [],
    deleted: [],

    findCollectionByNameOrId(idOrName) {
      const collection = collections.get(idOrName)
      if (!collection) throw new Error(`Collection "${idOrName}" was not found.`)
      return collection
    },

    save(collection) {
      if (!collection?.name) throw new Error('Saved collection is missing a name.')
      if (!Array.isArray(collection.fields)) {
        throw new Error(`Collection "${collection.name}" fields must be an array.`)
      }

      collections.set(collection.name, collection)
      this.saved.push(collection)
      return collection
    },

    delete(collection) {
      if (!collection?.name) throw new Error('Deleted collection is missing a name.')
      collections.delete(collection.name)
      this.deleted.push(collection)
      return true
    }
  }
}

const assertExpenseSchema = (app) => {
  const collection = app.findCollectionByNameOrId('expenses')
  assertExpenseCollection(collection)
}

const loadMigration = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf8')
  let captured = null

  const context = vm.createContext({
    Collection,
    TextField,
    console,
    migrate(up, down) {
      captured = { up, down }
    }
  })

  vm.runInContext(source, context, {
    filename: filePath,
    timeout: 1000
  })

  if (!captured) {
    throw new Error(`${path.basename(filePath)} did not register migrate(up, down).`)
  }

  return captured
}

const assertExpenseCollection = (collection) => {
  if (collection.name !== 'expenses') {
    throw new Error(`Expected collection name "expenses", received "${collection.name}".`)
  }

  if (collection.type !== 'base') {
    throw new Error(`Expected expenses collection type "base", received "${collection.type}".`)
  }

  if (collection.listRule !== '' || collection.viewRule !== '') {
    throw new Error('Expenses collection must be publicly readable for the frontend adapter.')
  }

  if (collection.createRule !== '' || collection.updateRule !== '' || collection.deleteRule !== '') {
    throw new Error('Expenses collection must allow frontend create, update, and delete operations.')
  }

  const actualFields = new Map(collection.fields.map((field) => [field.name, field.type]))

  for (const [name, type] of expectedExpenseFields) {
    if (actualFields.get(name) !== type) {
      throw new Error(`Expected expenses.${name} to be type "${type}".`)
    }
  }
}

const main = async () => {
  const entries = await fs.readdir(migrationsDir)
  const migrationFiles = entries
    .filter((entry) => /^\d+_.+\.js$/.test(entry))
    .sort()

  if (!migrationFiles.length) {
    throw new Error(`No PocketBase migrations found in ${migrationsDir}.`)
  }

  const app = createApp()
  const loadedMigrations = []

  for (const fileName of migrationFiles) {
    const filePath = path.join(migrationsDir, fileName)
    const migration = await loadMigration(filePath)

    await migration.up(app)
    loadedMigrations.push({ fileName, migration })

    if (!app.saved.length && fileName.includes('create_expenses_collection')) {
      throw new Error(`${fileName} did not save a collection in the up migration.`)
    }

    if (fileName.includes('expense')) {
      assertExpenseSchema(app)
    }

    console.log(`Checked ${fileName}`)
  }

  for (const { migration } of loadedMigrations.toReversed()) {
    await migration.down(app)
  }

  if (!app.deleted.length) {
    throw new Error('PocketBase migration rollback did not delete the expenses collection.')
  }
}

main().catch((error) => {
  console.error(error?.message || error)
  process.exitCode = 1
})
