import assert from 'node:assert/strict'
import { test } from 'node:test'
import { migrateBrandStorage } from '../src/services/brandStorageMigration.js'

function storage(entries = []) {
  const values = new Map(entries)
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  }
}

test('preserves preferences, connection paths and sessions across the rename', () => {
  const entries = [
    ['settings', '{"displayedCurrency":"EUR"}'],
    ['theme', 'dark'], ['language', 'fr'], ['sidebar-collapsed', 'true'],
    ['database-connection', '{"provider":"firebase","firebase":{"path":"subfolio/expenses"}}'],
    ['pocketbase-auth', '{"token":"test-token","record":{"id":"test-user"}}']
  ]
  const store = storage(entries.map(([suffix, value]) => [`subfolio-${suffix}`, value]))
  migrateBrandStorage(store)
  for (const [suffix, value] of entries) {
    assert.equal(store.getItem(`upkeep-${suffix}`), value)
    assert.equal(store.getItem(`subfolio-${suffix}`), null)
  }
  migrateBrandStorage(store)
  assert.equal(store.getItem('upkeep-language'), 'fr')
})

test('keeps newer preferences and does not restore an old session after logout', () => {
  const store = storage([
    ['subfolio-theme', 'dark'], ['upkeep-theme', 'light'],
    ['subfolio-pocketbase-auth', 'old-session'], ['upkeep-pocketbase-auth', 'new-session']
  ])
  migrateBrandStorage(store)
  assert.equal(store.getItem('upkeep-theme'), 'light')
  assert.equal(store.getItem('upkeep-pocketbase-auth'), 'new-session')
  store.removeItem('upkeep-pocketbase-auth')
  migrateBrandStorage(store)
  assert.equal(store.getItem('upkeep-pocketbase-auth'), null)
})

test('retains legacy data when a storage write fails', () => {
  const store = storage([['subfolio-settings', '{"displayedCurrency":"CAD"}']])
  store.setItem = () => { throw new Error('quota exceeded') }
  assert.doesNotThrow(() => migrateBrandStorage(store))
  assert.equal(store.getItem('subfolio-settings'), '{"displayedCurrency":"CAD"}')
  assert.doesNotThrow(() => migrateBrandStorage(undefined))
})
