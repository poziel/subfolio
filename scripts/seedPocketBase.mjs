import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { faker } from '@faker-js/faker'
import { serviceIconOptions } from '../src/data/serviceCatalog.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultRuntimeRoot = process.platform === 'win32'
  ? 'D:\\Dev\\6-miscellaneous\\pocketbase\\subfolio'
  : path.join(root, '.pocketbase')

const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)
const argValue = (name, fallback = '') => {
  const prefix = `${name}=`
  const match = rawArgs.find((item) => item.startsWith(prefix))
  return match ? match.slice(prefix.length) : fallback
}

const parsePositiveInt = (name, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const value = Number.parseInt(argValue(name, fallback), 10)

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`)
  }

  return value
}

const runtimeRoot = path.resolve(argValue('--runtime-root', process.env.SUBFOLIO_POCKETBASE_ROOT || defaultRuntimeRoot))
const dataDir = path.resolve(argValue('--dir', process.env.POCKETBASE_DATA_DIR || path.join(runtimeRoot, 'pb_data')))
const migrationsDir = path.join(root, 'pocketbase', 'pb_migrations')
const pocketBaseBin = argValue('--pocketbase-bin', process.env.POCKETBASE_BIN || 'pocketbase')
const collection = argValue('--collection', process.env.POCKETBASE_COLLECTION || 'expenses')
const authCollection = argValue('--auth-collection', process.env.POCKETBASE_AUTH_COLLECTION || 'users')
const identity =
  argValue('--user') ||
  argValue('--identity') ||
  argValue('--username') ||
  argValue('--email') ||
  process.env.POCKETBASE_SEED_USER ||
  process.env.POCKETBASE_AUTH_USERNAME ||
  process.env.POCKETBASE_AUTH_EMAIL ||
  ''
const count = parsePositiveInt('--count', process.env.POCKETBASE_SEED_COUNT || '100', { max: 100000 })
const categoryCount = parsePositiveInt('--categories', process.env.POCKETBASE_SEED_CATEGORIES || '12', { max: 1000 })
const currency = argValue('--currency', process.env.POCKETBASE_SEED_CURRENCY || 'CAD').trim().toUpperCase()
const seed = Number.parseInt(argValue('--seed', process.env.POCKETBASE_SEED_RANDOM || String(Date.now())), 10)
const legacyDataset = argValue('--dataset')
const reset = args.has('--reset')
const dryRun = args.has('--dry-run')
const listUsers = args.has('--list-users')
const help = args.has('--help') || args.has('-h')

const usage = `Usage:
  npm run seed:pocketbase -- --user=<username-or-email> [options]

Options:
  --user=<value>           PocketBase username or email to receive expenses
  --username=<value>       Alias for --user
  --email=<value>          Alias for --user
  --count=<number>         Generated expense count (default 100)
  --categories=<number>    Number of generated categories (default 12)
  --currency=<code>        Currency code for generated expenses (default CAD)
  --reset                  Delete existing expenses for the selected user first
  --seed=<number>          Deterministic Faker seed
  --dir=<path>             PocketBase pb_data directory
  --runtime-root=<path>    PocketBase runtime root containing pb_data
  --collection=<name>      Expenses collection name (default expenses)
  --auth-collection=<name> Auth collection name (default users)
  --list-users             Print local PocketBase users and exit
  --dry-run                Print a summary without writing to PocketBase`

const warnLegacyDataset = () => {
  if (legacyDataset) {
    console.warn(`Ignoring legacy --dataset=${legacyDataset}; generated seeding uses --count and --categories.`)
  }
}

const weightedFrequencies = [
  ...Array(48).fill('monthly'),
  ...Array(14).fill('yearly'),
  ...Array(12).fill('weekly'),
  ...Array(10).fill('quarterly'),
  ...Array(8).fill('bi-weekly'),
  ...Array(5).fill('semi-annually'),
  ...Array(3).fill('custom')
]

const titleCase = (value) =>
  String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

const toIsoDate = (date) => date.toISOString().slice(0, 10)

const createCategories = (total) => {
  const categories = new Set()
  let attempts = 0

  while (categories.size < total && attempts < total * 20) {
    const category = titleCase(faker.commerce.department().replace(/,/g, ''))
    if (category) categories.add(category)
    attempts += 1
  }

  while (categories.size < total) {
    categories.add(`Category ${categories.size + 1}`)
  }

  return [...categories]
}

const createPocketBaseId = (usedIds) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''

  do {
    id = Array.from({ length: 15 }, () => alphabet[faker.number.int({ min: 0, max: alphabet.length - 1 })]).join('')
  } while (usedIds.has(id))

  usedIds.add(id)
  return id
}

const createDatePattern = (frequency) => {
  const dayOfMonth = faker.number.int({ min: 1, max: 28 })
  const dayOfWeek = faker.number.int({ min: 0, max: 6 })
  const nthWeek = faker.number.int({ min: 1, max: 4 })
  const month = faker.number.int({ min: 0, max: 11 })

  if (frequency === 'weekly' || frequency === 'bi-weekly') {
    return { type: 'day-of-week', dayOfWeek }
  }

  if (frequency === 'yearly') {
    return faker.datatype.boolean()
      ? { type: 'day-of-year', month, dayOfMonth }
      : { type: 'nth-weekday-year', month, nthWeek, dayOfWeek }
  }

  if (frequency === 'custom') {
    return faker.helpers.arrayElement([
      { type: 'day-of-month', dayOfMonth },
      { type: 'day-of-year', month, dayOfMonth },
      { type: 'nth-weekday', nthWeek, dayOfWeek },
      { type: 'interval', intervalDays: faker.number.int({ min: 10, max: 90 }) }
    ])
  }

  return faker.datatype.boolean()
    ? { type: 'day-of-month', dayOfMonth }
    : { type: 'nth-weekday', nthWeek, dayOfWeek }
}

const amountRangeFor = (frequency) => {
  if (frequency === 'weekly' || frequency === 'bi-weekly') return { min: 8, max: 240 }
  if (frequency === 'quarterly' || frequency === 'semi-annually') return { min: 45, max: 900 }
  if (frequency === 'yearly') return { min: 80, max: 3000 }
  if (frequency === 'custom') return { min: 10, max: 650 }
  return { min: 4, max: 420 }
}

const createExpenseName = () => {
  const source = faker.helpers.arrayElement([
    () => `${faker.company.name()} ${faker.commerce.product()}`,
    () => `${faker.commerce.productAdjective()} ${faker.commerce.product()} Plan`,
    () => `${faker.company.buzzNoun()} ${faker.helpers.arrayElement(['Suite', 'Cloud', 'Pass', 'Membership', 'Coverage'])}`
  ])

  return titleCase(source()).slice(0, 255)
}

const createExpenses = () => {
  faker.seed(seed)

  const categories = createCategories(categoryCount)
  const icons = serviceIconOptions.map((item) => item.value)
  const usedIds = new Set()

  return Array.from({ length: count }, () => {
    const frequency = faker.helpers.arrayElement(weightedFrequencies)
    const amountRange = amountRangeFor(frequency)
    const taxRate = faker.helpers.arrayElement([0, 0, 0, 5, 9.975, 13, 15])
    const startDate = faker.date.between({ from: '2023-01-01T00:00:00.000Z', to: new Date() })
    const createdAt = faker.date.between({ from: startDate, to: new Date() }).toISOString()

    return {
      id: createPocketBaseId(usedIds),
      name: createExpenseName(),
      category: faker.helpers.arrayElement(categories),
      amount: Number(faker.number.float(amountRange).toFixed(2)),
      currency,
      url: faker.datatype.boolean({ probability: 0.45 }) ? `https://${faker.internet.domainName()}` : '',
      icon: faker.helpers.arrayElement(icons),
      note: faker.datatype.boolean({ probability: 0.25 }) ? faker.lorem.sentence() : '',
      includesTax: faker.datatype.boolean({ probability: 0.72 }),
      taxRate,
      frequency,
      customTimesPerYear: frequency === 'custom' ? faker.number.int({ min: 3, max: 36 }) : null,
      startDate: toIsoDate(startDate),
      datePattern: createDatePattern(frequency),
      active: faker.datatype.boolean({ probability: 0.92 }),
      createdAt,
      updatedAt: new Date().toISOString()
    }
  })
}

const createMigrationSource = (records) => {
  const recordIds = records.map((record) => record.id)

  return `migrate((app) => {
  const identity = ${JSON.stringify(identity)}
  const collectionName = ${JSON.stringify(collection)}
  const authCollectionName = ${JSON.stringify(authCollection)}
  const expenses = ${JSON.stringify(records, null, 2)}

  if (!identity) {
    throw new Error('Seed user identity is required.')
  }

  let user = null

  try {
    user = app.findFirstRecordByFilter(
      authCollectionName,
      'username = {:identity} || email = {:identity}',
      { identity }
    )
  } catch {
    const users = app.findRecordsByFilter(authCollectionName, '', 'created', 25, 0)
    const knownUsers = users.map((record) => {
      const parts = []
      const username = record.getString('username')
      const email = record.getString('email')
      const name = record.getString('name')

      if (username) parts.push('username=' + username)
      if (email) parts.push('email=' + email)
      if (name) parts.push('name=' + name)

      return parts.length ? parts.join(', ') : record.id
    }).join('; ')

    throw new Error(
      'No PocketBase user found for "' + identity + '". ' +
      'Run "npm run seed:pocketbase -- --list-users" to inspect local users, ' +
      'then seed with --user, --username, or --email. ' +
      (knownUsers ? 'Known users: ' + knownUsers : 'No users exist in "' + authCollectionName + '".')
    )
  }

  const collection = app.findCollectionByNameOrId(collectionName)

  if (${JSON.stringify(reset)}) {
    const existing = app.findRecordsByFilter(collectionName, 'user = {:user}', '', 100000, 0, { user: user.id })
    for (const record of existing) {
      app.delete(record)
    }
  }

  for (const expense of expenses) {
    app.save(new Record(collection, { ...expense, user: user.id }))
  }
}, (app) => {
  const collectionName = ${JSON.stringify(collection)}
  const recordIds = ${JSON.stringify(recordIds, null, 2)}

  for (const id of recordIds) {
    try {
      app.delete(app.findRecordById(collectionName, id))
    } catch {
      // Already removed.
    }
  }
})
`
}

const createListUsersMigrationSource = () => `migrate((app) => {
  const authCollectionName = ${JSON.stringify(authCollection)}
  const users = app.findRecordsByFilter(authCollectionName, '', 'created', 500, 0)
  const rows = users.map((record) => ({
    id: record.id,
    username: record.getString('username'),
    email: record.getString('email'),
    name: record.getString('name'),
    verified: record.getBool('verified')
  }))

  console.log(JSON.stringify(rows, null, 2))
}, () => {})
`

const runPocketBase = (commandArgs, { input } = {}) => {
  const result = spawnSync(pocketBaseBin, commandArgs, {
    cwd: root,
    input,
    encoding: 'utf8'
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  const output = `${result.stdout || ''}\n${result.stderr || ''}`

  if (result.error) throw result.error
  if (result.status !== 0 || /(^|\n)Error:|failed to apply migration/i.test(output)) {
    throw new Error(`PocketBase command failed: ${commandArgs.join(' ')}`)
  }
}

const ensureReady = async () => {
  await fs.access(dataDir)
  await fs.access(migrationsDir)
}

const runTemporaryMigration = async (source) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'subfolio-pocketbase-seed-'))
  const migrationPath = path.join(tempDir, `${Date.now()}_seed_generated_expenses.js`)

  try {
    await fs.writeFile(migrationPath, source, 'utf8')
    runPocketBase(['migrate', 'up', '--dir', dataDir, '--migrationsDir', tempDir])
    await fs.rm(migrationPath, { force: true })
    runPocketBase(['migrate', 'history-sync', '--dir', dataDir, '--migrationsDir', migrationsDir], { input: 'y\n' })
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

const main = async () => {
  if (help) {
    console.log(usage)
    return
  }

  if (listUsers) {
    await ensureReady()
    await runTemporaryMigration(createListUsersMigrationSource())
    return
  }

  warnLegacyDataset()

  if (!identity) {
    throw new Error('Seeding requires --user, --username, or --email.')
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('--currency must be a three-letter currency code.')
  }

  const records = createExpenses()
  const categories = new Set(records.map((record) => record.category))

  if (dryRun) {
    console.log(`Would seed ${records.length} generated expenses across ${categories.size} categories for ${identity}.`)
    console.log(JSON.stringify(records.slice(0, 3), null, 2))
    return
  }

  await ensureReady()
  await runTemporaryMigration(createMigrationSource(records))

  console.log(`Seeded ${records.length} generated expenses across ${categories.size} categories for ${identity}.`)
}

main().catch((error) => {
  console.error(error?.message || error)
  process.exitCode = 1
})
