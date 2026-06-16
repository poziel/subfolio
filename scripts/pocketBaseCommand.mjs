import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultRuntimeRoot = process.platform === 'win32'
  ? 'D:\\Dev\\6-miscellaneous\\pocketbase\\subfolio'
  : path.join(repoRoot, '.pocketbase')

const runtimeRoot = path.resolve(process.env.SUBFOLIO_POCKETBASE_ROOT || defaultRuntimeRoot)
const paths = {
  data: path.join(runtimeRoot, 'pb_data'),
  hooks: path.join(runtimeRoot, 'pb_hooks'),
  public: path.join(runtimeRoot, 'pb_public'),
  migrations: path.join(repoRoot, 'pocketbase', 'pb_migrations')
}

const rawArgs = process.argv.slice(2)
const dryRun = rawArgs.includes('--dry-run')
const help = rawArgs.includes('--help') || rawArgs.includes('-h')
const forwardedArgs = rawArgs.filter((arg) => arg !== '--dry-run')
const firstArg = forwardedArgs[0]
const command = firstArg && !firstArg.startsWith('-') ? firstArg : 'serve'
const commandArgs = firstArg && !firstArg.startsWith('-') ? forwardedArgs.slice(1) : forwardedArgs

const usage = `Usage:
  npm run db -- serve [pocketbase serve args]
  npm run db -- migrate up [pocketbase migrate args]
  npm run db -- update [pocketbase update args]

Environment:
  SUBFOLIO_POCKETBASE_ROOT=${runtimeRoot}

Use --dry-run to print the generated PocketBase command without running it.`

const hasFlag = (args, name) =>
  args.some((arg, index) => arg === name || arg.startsWith(`${name}=`) || args[index - 1] === name)

const quote = (value) => {
  const text = String(value)
  return /\s/.test(text) ? `"${text.replace(/"/g, '\\"')}"` : text
}

const ensureRuntimeFolders = async () => {
  await fs.mkdir(paths.data, { recursive: true })
  await fs.mkdir(paths.hooks, { recursive: true })
  await fs.mkdir(paths.public, { recursive: true })
  await fs.access(paths.migrations)
}

const withDefaultFlag = (args, name, value) =>
  hasFlag(args, name) ? args : [...args, `${name}=${value}`]

const pushDefaultFlag = (args, name, value, overrides = []) => {
  if (!hasFlag(overrides, name)) {
    args.push(`${name}=${value}`)
  }

  return args
}

const buildPocketBaseArgs = () => {
  if (command === 'serve') {
    let args = ['serve']

    if (!hasFlag(commandArgs, '--dev')) {
      args.push('--dev')
    }

    args = pushDefaultFlag(args, '--dir', paths.data, commandArgs)
    args = pushDefaultFlag(args, '--hooksDir', paths.hooks, commandArgs)
    args = pushDefaultFlag(args, '--publicDir', paths.public, commandArgs)
    args = pushDefaultFlag(args, '--migrationsDir', paths.migrations, commandArgs)

    return [...args, ...commandArgs]
  }

  if (command === 'migrate') {
    let args = ['migrate', ...commandArgs]
    args = withDefaultFlag(args, '--dir', paths.data)
    args = withDefaultFlag(args, '--migrationsDir', paths.migrations)
    return args
  }

  return [command, ...commandArgs]
}

const main = async () => {
  if (help) {
    console.log(usage)
    return
  }

  if (!dryRun && (command === 'serve' || command === 'migrate')) {
    await ensureRuntimeFolders()
  }

  const pocketBaseArgs = buildPocketBaseArgs()
  const printableCommand = ['pocketbase', ...pocketBaseArgs].map(quote).join(' ')

  if (dryRun) {
    console.log(printableCommand)
    return
  }

  const child = spawn('pocketbase', pocketBaseArgs, {
    cwd: repoRoot,
    stdio: 'inherit'
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exitCode = code ?? 1
  })
}

main().catch((error) => {
  console.error(error?.message || error)
  process.exitCode = 1
})
