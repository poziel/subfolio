migrate((app) => {
  const collection = app.findCollectionByNameOrId('categories')
  const fields = collection.fields || []
  const fieldNames = new Set(fields.map((field) => field.name))

  const addField = (field) => {
    if (fieldNames.has(field.name)) return

    if (typeof fields.addMarshaledJSON === 'function') {
      fields.addMarshaledJSON(JSON.stringify(field))
    } else {
      fields.add(field)
    }

    fieldNames.add(field.name)
  }

  addField({ type: 'text', name: 'status', required: false, max: 20 })
  addField({ type: 'text', name: 'icon', required: false, max: 120 })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('categories')
  collection.fields = (collection.fields || []).filter((field) => ![
    'status',
    'icon'
  ].includes(field.name))

  return app.save(collection)
})
