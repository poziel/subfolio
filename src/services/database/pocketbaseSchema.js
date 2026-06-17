export const pocketBaseExpenseFields = [
  'id',
  'user',
  'name',
  'presetId',
  'categoryId',
  'category',
  'amount',
  'currency',
  'url',
  'icon',
  'note',
  'includesTax',
  'taxRateId',
  'taxRate',
  'scheduleType',
  'paymentDate',
  'repeatInterval',
  'repeatUnit',
  'repeatPattern',
  'recurrenceSummary',
  'frequency',
  'customTimesPerYear',
  'startDate',
  'startTime',
  'paymentTimezone',
  'datePattern',
  'recurrenceSchedule',
  'active',
  'createdAt',
  'updatedAt',
  'created',
  'updated'
]

export const pocketBaseCategoryFields = [
  'id',
  'user',
  'name',
  'normalizedName',
  'createdAt',
  'updatedAt',
  'created',
  'updated'
]

const getResponseMessage = (error) =>
  error?.response?.message || error?.message || 'PocketBase schema validation failed.'

export class PocketBaseSchemaError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'PocketBaseSchemaError'
    this.cause = options.cause
    this.status = options.status
  }
}

export const ensurePocketBaseSchema = async (client, collection, categoryCollection = 'categories') => {
  try {
    await client.health.check()
    await client.collection(collection).getList(1, 1, {
      fields: pocketBaseExpenseFields.join(','),
      requestKey: null
    })
    await client.collection(categoryCollection).getList(1, 1, {
      fields: pocketBaseCategoryFields.join(','),
      requestKey: null
    })
  } catch (error) {
    const status = error?.status

    if (status === 404) {
      throw new PocketBaseSchemaError(
        `PocketBase collection "${collection}" or "${categoryCollection}" is missing. Run the Subfolio PocketBase migrations before using this connection.`,
        { cause: error, status }
      )
    }

    if (status === 403 || status === 401) {
      throw new PocketBaseSchemaError(
        `PocketBase collection "${collection}" is not readable by this app. Check the collection API rules or run the Subfolio PocketBase migration.`,
        { cause: error, status }
      )
    }

    throw new PocketBaseSchemaError(getResponseMessage(error), { cause: error, status })
  }
}
