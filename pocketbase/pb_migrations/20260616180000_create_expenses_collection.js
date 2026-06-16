migrate((app) => {
  try {
    app.findCollectionByNameOrId('expenses')
    return
  } catch {
    // Collection does not exist yet.
  }

  const collection = new Collection({
    type: 'base',
    name: 'expenses',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
    fields: [
      { type: 'text', name: 'name', required: true, max: 255 },
      { type: 'text', name: 'category', required: true, max: 120 },
      { type: 'number', name: 'amount', required: true, min: 0 },
      { type: 'text', name: 'currency', required: true, min: 3, max: 3 },
      { type: 'text', name: 'url', required: false, max: 2048 },
      { type: 'text', name: 'icon', required: false, max: 120 },
      { type: 'text', name: 'note', required: false, max: 3000 },
      { type: 'bool', name: 'includesTax', required: false },
      { type: 'number', name: 'taxRate', required: false, min: 0 },
      { type: 'text', name: 'frequency', required: true, max: 40 },
      { type: 'number', name: 'customTimesPerYear', required: false, min: 0 },
      { type: 'text', name: 'startDate', required: false, max: 20 },
      { type: 'json', name: 'datePattern', required: false },
      { type: 'bool', name: 'active', required: false },
      { type: 'text', name: 'createdAt', required: false, max: 40 },
      { type: 'text', name: 'updatedAt', required: false, max: 40 }
    ]
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('expenses')
  return app.delete(collection)
})
