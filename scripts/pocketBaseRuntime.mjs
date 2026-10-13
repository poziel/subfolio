import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

export function getPocketBaseRuntimeRoot(repoRoot) {
  const configured = process.env.UPKEEP_POCKETBASE_ROOT || process.env.SUBFOLIO_POCKETBASE_ROOT
  if (configured) return configured
  if (process.platform !== 'win32') return path.join(repoRoot, '.pocketbase')

  const root = 'D:\\Dev\\6-miscellaneous\\pocketbase'
  const current = path.join(root, 'upkeep')
  const legacy = path.join(root, 'subfolio')
  // Existing database files must remain reachable after the product rename.
  return !existsSync(current) && existsSync(legacy) ? legacy : current
}
