migrate((app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  const expenseFields = expenseCollection.fields || []
  const expenseFieldNames = new Set(expenseFields.map((field) => field.name))

  if (!expenseFieldNames.has('taxRateId')) {
    const field = { type: 'text', name: 'taxRateId', required: false, max: 120 }
    if (typeof expenseFields.addMarshaledJSON === 'function') {
      expenseFields.addMarshaledJSON(JSON.stringify(field))
    } else {
      expenseFields.add(field)
    }
  }

  return app.save(expenseCollection)
}, (app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  expenseCollection.fields = (expenseCollection.fields || []).filter((field) => field.name !== 'taxRateId')

  return app.save(expenseCollection)
})
