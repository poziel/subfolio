import PocketBase, { LocalAuthStore } from 'pocketbase'
import { managedPocketBaseConfig } from '../config/pocketbase'

let managedClient = null

export const getManagedPocketBaseClient = () => {
  if (!managedClient) {
    managedClient = new PocketBase(
      managedPocketBaseConfig.url,
      new LocalAuthStore(managedPocketBaseConfig.authStoreKey)
    )
  }

  return managedClient
}

export const isManagedPocketBaseConnection = (config) =>
  String(config?.url || '').replace(/\/+$/, '') === managedPocketBaseConfig.url &&
  String(config?.collection || '').trim() === managedPocketBaseConfig.collection
