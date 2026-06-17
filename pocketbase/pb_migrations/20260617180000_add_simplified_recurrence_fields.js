migrate((app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  const expenseFields = expenseCollection.fields || []
  const expenseFieldNames = new Set(expenseFields.map((field) => field.name))
  const fields = [
    { type: 'text', name: 'paymentDate', required: false, max: 20 },
    { type: 'number', name: 'repeatInterval', required: false, min: 0 },
    { type: 'text', name: 'repeatUnit', required: false, max: 20 },
    { type: 'text', name: 'repeatPattern', required: false, max: 60 },
    { type: 'text', name: 'recurrenceSummary', required: false, max: 500 }
  ].filter((field) => !expenseFieldNames.has(field.name))

  if (fields.length) {
    if (typeof expenseFields.addMarshaledJSON === 'function') {
      expenseFields.addMarshaledJSON(JSON.stringify(fields))
    } else {
      fields.forEach((field) => expenseFields.add(field))
    }
  }

  return app.save(expenseCollection)
}, (app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  const simplifiedFields = new Set([
    'paymentDate',
    'repeatInterval',
    'repeatUnit',
    'repeatPattern',
    'recurrenceSummary'
  ])

  expenseCollection.fields = (expenseCollection.fields || []).filter((field) => !simplifiedFields.has(field.name))

  return app.save(expenseCollection)
})
