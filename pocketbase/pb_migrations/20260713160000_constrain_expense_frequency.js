const frequencyValues = [
  'once',
  'yearly',
  'monthly',
  'weekly',
  'bi-weekly',
  'daily',
  'quarterly',
  'semi-annually',
  'custom'
]

migrate((app) => {
  const collection = app.findCollectionByNameOrId('expenses')
  const fields = collection.fields || []
  if (fields.removeByName) {
    fields.removeByName('frequency')
  } else {
    collection.fields = fields.filter((field) => field.name !== 'frequency')
  }

  const nextFields = collection.fields || fields
  nextFields.add(new SelectField({
    name: 'frequency',
    required: true,
    maxSelect: 1,
    values: frequencyValues
  }))

  if (nextFields.removeByName) {
    nextFields.removeByName('customTimesPerYear')
  } else {
    collection.fields = nextFields.filter((field) => field.name !== 'customTimesPerYear')
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('expenses')
  const fields = collection.fields || []
  if (fields.removeByName) {
    fields.removeByName('frequency')
  } else {
    collection.fields = fields.filter((field) => field.name !== 'frequency')
  }

  const nextFields = collection.fields || fields
  nextFields.add(new TextField({
    name: 'frequency',
    required: true,
    max: 40
  }))
  nextFields.add(new NumberField({
    name: 'customTimesPerYear',
    required: false,
    min: 0
  }))

  return app.save(collection)
})
