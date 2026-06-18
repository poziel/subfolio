import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = path.join(root, 'pocketbase', 'pb_migrations')

const expectedExpenseFields = new Map([
  ['user', 'relation'],
  ['name', 'text'],
  ['presetId', 'text'],
  ['categoryId', 'text'],
  ['category', 'text'],
  ['amount', 'number'],
  ['currency', 'text'],
  ['url', 'text'],
  ['icon', 'text'],
  ['note', 'text'],
  ['includesTax', 'bool'],
  ['taxRateId', 'text'],
  ['taxRate', 'number'],
  ['scheduleType', 'text'],
  ['paymentDate', 'text'],
  ['repeatInterval', 'number'],
  ['repeatUnit', 'text'],
  ['repeatPattern', 'text'],
  ['recurrenceSummary', 'text'],
  ['frequency', 'text'],
  ['customTimesPerYear', 'number'],
  ['startDate', 'text'],
  ['startTime', 'text'],
  ['paymentTimezone', 'text'],
  ['datePattern', 'json'],
  ['recurrenceSchedule', 'json'],
  ['active', 'bool'],
  ['createdAt', 'text'],
  ['updatedAt', 'text']
])

const expectedCategoryFields = new Map([
  ['user', 'relation'],
  ['name', 'text'],
  ['normalizedName', 'text'],
  ['createdAt', 'text'],
  ['updatedAt', 'text']
])

const expectedAuthIdentityFields = ['username', 'email']

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

class RelationField {
  constructor(model = {}) {
    Object.assign(this, { type: 'relation' }, model)
  }
}

class JsonField {
  constructor(model = {}) {
    Object.assign(this, { type: 'json' }, model)
  }
}

const createFieldsList = (fields = []) => {
  const list = [...fields]
  list.add = (field) => {
    list.push(field)
    return field
  }
  list.addMarshaledJSON = (rawJSON) => {
    const parsed = JSON.parse(rawJSON)
    const fieldsToAdd = Array.isArray(parsed) ? parsed : [parsed]
    fieldsToAdd.forEach((field) => list.add(field))
  }
  return list
}

const registerCollection = (collections, collection) => {
  collections.set(collection.name, collection)

  if (collection.id) {
    collections.set(collection.id, collection)
  }
}

const createDefaultUsersCollection = () =>
  new Collection({
    id: '_pb_users_auth_',
    type: 'auth',
    name: 'users',
    fields: [
      { type: 'email', name: 'email', required: true },
      { type: 'bool', name: 'verified', required: false },
      { type: 'text', name: 'name', required: false, max: 255 }
    ],
    indexes: ['CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != \'\''],
    passwordAuth: {
      enabled: true,
      identityFields: ['email']
    }
  })

const createApp = () => {
  const collections = new Map()
  registerCollection(collections, createDefaultUsersCollection())

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

      registerCollection(collections, collection)
      this.saved.push(collection)
      return collection
    },

    delete(collection) {
      if (!collection?.name) throw new Error('Deleted collection is missing a name.')
      collections.delete(collection.name)
      if (collection.id) collections.delete(collection.id)
      this.deleted.push(collection)
      return true
    }
  }
}

const assertExpenseSchema = (app) => {
  const collection = app.findCollectionByNameOrId('expenses')
  assertExpenseCollection(collection)
}

const assertAuthSchema = (app) => {
  const collection = app.findCollectionByNameOrId('_pb_users_auth_')
  assertUsersCollection(collection)
}

const assertCategorySchema = (app) => {
  const collection = app.findCollectionByNameOrId('categories')
  assertCategoryCollection(collection)
}

const loadMigration = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf8')
  let captured = null

  const context = vm.createContext({
    Collection,
    JSONField: JsonField,
    JsonField,
    RelationField,
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

  const ownerRule = '@request.auth.id != "" && user = @request.auth.id'

  if (collection.listRule !== ownerRule || collection.viewRule !== ownerRule) {
    throw new Error('Expenses collection must be readable only by the authenticated owner.')
  }

  if (
    collection.createRule !== ownerRule ||
    collection.updateRule !== ownerRule ||
    collection.deleteRule !== ownerRule
  ) {
    throw new Error('Expenses collection writes must be restricted to the authenticated owner.')
  }

  const actualFields = new Map(collection.fields.map((field) => [field.name, field.type]))

  for (const [name, type] of expectedExpenseFields) {
    if (actualFields.get(name) !== type) {
      throw new Error(`Expected expenses.${name} to be type "${type}".`)
    }
  }
}

const assertCategoryCollection = (collection) => {
  if (collection.name !== 'categories') {
    throw new Error(`Expected collection name "categories", received "${collection.name}".`)
  }

  if (collection.type !== 'base') {
    throw new Error(`Expected categories collection type "base", received "${collection.type}".`)
  }

  const ownerRule = '@request.auth.id != "" && user = @request.auth.id'

  if (collection.listRule !== ownerRule || collection.viewRule !== ownerRule) {
    throw new Error('Categories collection must be readable only by the authenticated owner.')
  }

  if (
    collection.createRule !== ownerRule ||
    collection.updateRule !== ownerRule ||
    collection.deleteRule !== ownerRule
  ) {
    throw new Error('Categories collection writes must be restricted to the authenticated owner.')
  }

  const actualFields = new Map(collection.fields.map((field) => [field.name, field.type]))

  for (const [name, type] of expectedCategoryFields) {
    if (actualFields.get(name) !== type) {
      throw new Error(`Expected categories.${name} to be type "${type}".`)
    }
  }

  if (!collection.indexes?.some((index) => index.includes('idx_categories_user_normalized_name'))) {
    throw new Error('Categories collection must enforce unique normalized names per user.')
  }
}

const assertUsersCollection = (collection) => {
  if (collection.name !== 'users') {
    throw new Error(`Expected auth collection name "users", received "${collection.name}".`)
  }

  if (collection.type !== 'auth') {
    throw new Error(`Expected users collection type "auth", received "${collection.type}".`)
  }

  if (collection.passwordAuth?.enabled !== true) {
    throw new Error('Users collection must have password auth enabled.')
  }

  const identityFields = collection.passwordAuth?.identityFields || []

  for (const field of expectedAuthIdentityFields) {
    if (!identityFields.includes(field)) {
      throw new Error(`Users password auth must accept "${field}" as an identity field.`)
    }
  }

  const actualFields = new Map(collection.fields.map((field) => [field.name, field.type]))

  if (actualFields.get('username') !== 'text') {
    throw new Error('Expected users.username to be type "text".')
  }

  const fieldNames = collection.fields.map((field) => field.name)
  const usernameIndex = fieldNames.indexOf('username')
  const emailIndex = fieldNames.indexOf('email')

  if (usernameIndex === -1 || emailIndex === -1 || usernameIndex > emailIndex) {
    throw new Error('Expected users.username to be ordered before users.email.')
  }

  if (actualFields.get('name') !== 'text') {
    throw new Error('Expected users.name to be type "text".')
  }

  if (!collection.indexes?.some((index) => index.includes('idx_username__pb_users_auth_'))) {
    throw new Error('Users collection must enforce unique usernames.')
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

    console.log(`Checked ${fileName}`)
  }

  assertExpenseSchema(app)
  assertCategorySchema(app)
  assertAuthSchema(app)

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
