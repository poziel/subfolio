migrate((app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  const expenseFields = expenseCollection.fields || []
  const expenseFieldNames = new Set(expenseFields.map((field) => field.name))

  if (!expenseFieldNames.has('scheduleType')) {
    const field = { type: 'text', name: 'scheduleType', required: false, max: 30 }
    if (typeof expenseFields.addMarshaledJSON === 'function') {
      expenseFields.addMarshaledJSON(JSON.stringify(field))
    } else {
      expenseFields.add(field)
    }
  }

  return app.save(expenseCollection)
}, (app) => {
  const expenseCollection = app.findCollectionByNameOrId('expenses')
  expenseCollection.fields = (expenseCollection.fields || []).filter((field) => field.name !== 'scheduleType')

  return app.save(expenseCollection)
})
