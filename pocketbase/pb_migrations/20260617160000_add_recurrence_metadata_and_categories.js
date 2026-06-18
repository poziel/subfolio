migrate((app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  const expenseFields = expenseCollection.fields || []
  const expenseFieldNames = new Set(expenseFields.map((field) => field.name))

  const addField = (fields, fieldNames, field) => {
    if (!fieldNames.has(field.name)) {
      if (typeof fields.addMarshaledJSON === 'function') {
        fields.addMarshaledJSON(JSON.stringify(field))
      } else {
        fields.add(field)
      }
      fieldNames.add(field.name)
    }
  }

  const addExpenseField = (field) => addField(expenseFields, expenseFieldNames, field)

  addExpenseField({ type: 'text', name: 'presetId', required: false, max: 120 })
  addExpenseField({ type: 'text', name: 'categoryId', required: false, max: 120 })
  addExpenseField({ type: 'text', name: 'startTime', required: false, max: 20 })
  addExpenseField({ type: 'text', name: 'paymentTimezone', required: false, max: 120 })
  addExpenseField({ type: 'json', name: 'recurrenceSchedule', required: false })

  app.save(expenseCollection)

  let categoryCollection = null

  try {
    categoryCollection = app.findCollectionByNameOrId('categories')
  } catch {
    categoryCollection = new Collection({
      type: 'base',
      name: 'categories',
      fields: []
    })
  }

  const categoryFields = categoryCollection.fields || []
  const categoryFieldNames = new Set(categoryFields.map((field) => field.name))

  const addCategoryField = (field) => addField(categoryFields, categoryFieldNames, field)

  addCategoryField({
    type: 'relation',
    name: 'user',
    required: true,
    collectionId: '_pb_users_auth_',
    cascadeDelete: true,
    minSelect: 1,
    maxSelect: 1
  })
  addCategoryField({ type: 'text', name: 'name', required: true, max: 120 })
  addCategoryField({ type: 'text', name: 'normalizedName', required: true, max: 120 })
  addCategoryField({ type: 'text', name: 'createdAt', required: false, max: 40 })
  addCategoryField({ type: 'text', name: 'updatedAt', required: false, max: 40 })

  const ownerRule = '@request.auth.id != "" && user = @request.auth.id'
  categoryCollection.listRule = ownerRule
  categoryCollection.viewRule = ownerRule
  categoryCollection.createRule = ownerRule
  categoryCollection.updateRule = ownerRule
  categoryCollection.deleteRule = ownerRule
  categoryCollection.indexes = categoryCollection.indexes || []

  const categoryIndexName = 'idx_categories_user_normalized_name'
  const categoryIndex = 'CREATE UNIQUE INDEX `idx_categories_user_normalized_name` ON `categories` (`user`, `normalizedName`)'

  if (!categoryCollection.indexes.some((index) => index.includes(categoryIndexName))) {
    categoryCollection.indexes.push(categoryIndex)
  }

  return app.save(categoryCollection)
}, (app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  expenseCollection.fields = (expenseCollection.fields || []).filter((field) => ![
    'presetId',
    'categoryId',
    'startTime',
    'paymentTimezone',
    'recurrenceSchedule'
  ].includes(field.name))
  app.save(expenseCollection)

  try {
    const categoryCollection = app.findCollectionByNameOrId('categories')
    return app.delete(categoryCollection)
  } catch {
    return null
  }
})
