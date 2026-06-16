migrate((app) => {
  const collection = app.findCollectionByNameOrId('expenses')
  const fields = collection.fields || []
  const fieldNames = new Set(fields.map((field) => field.name))

  if (!fieldNames.has('icon')) {
    fields.add(new TextField({ name: 'icon', required: false, max: 120 }))
  }

  if (!fieldNames.has('note')) {
    fields.add(new TextField({ name: 'note', required: false, max: 3000 }))
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('expenses')
  collection.fields = (collection.fields || []).filter((field) => !['icon', 'note'].includes(field.name))
  return app.save(collection)
})
