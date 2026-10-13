// Keep existing browser preferences and sessions when upgrading to Upkeep.
export function migrateBrandStorage(storage) {
  if (!storage) return

  for (const suffix of [
    'settings', 'theme', 'language', 'sidebar-collapsed',
    'database-connection', 'pocketbase-auth'
  ]) {
    const oldKey = `subfolio-${suffix}`
    const newKey = `upkeep-${suffix}`
    try {
      const previous = storage.getItem(oldKey)
      if (previous === null) continue
      if (storage.getItem(newKey) === null) storage.setItem(newKey, previous)
      storage.removeItem(oldKey)
    } catch {
      // Retain the old value if storage is unavailable or the copy fails.
    }
  }
}

try {
  if (typeof window !== 'undefined') migrateBrandStorage(window.localStorage)
} catch {
  // Browsers may deny access to the storage object itself.
}
