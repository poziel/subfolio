migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId('_pb_users_auth_')
  const userFields = usersCollection.fields || []
  const userFieldNames = new Set(userFields.map((field) => field.name))

  if (!userFieldNames.has('username')) {
    const usernameField = new TextField({
      name: 'username',
      required: false,
      min: 3,
      max: 60,
      pattern: '^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$'
    })
    const emailIndex = userFields.findIndex((field) => field.name === 'email')

    if (emailIndex >= 0) {
      userFields.splice(emailIndex, 0, usernameField)
    } else {
      userFields.add(usernameField)
    }
  }

  if (!userFieldNames.has('name')) {
    userFields.add(new TextField({
      name: 'name',
      required: false,
      max: 255
    }))
  }

  usersCollection.passwordAuth = usersCollection.passwordAuth || {}
  usersCollection.passwordAuth.enabled = true
  usersCollection.passwordAuth.identityFields = ['username', 'email']

  usersCollection.indexes = usersCollection.indexes || []
  const usernameIndexName = 'idx_username__pb_users_auth_'
  const usernameIndex = 'CREATE UNIQUE INDEX `idx_username__pb_users_auth_` ON `users` (`username`) WHERE `username` != \'\''

  if (!usersCollection.indexes.some((index) => index.includes(usernameIndexName))) {
    usersCollection.indexes.push(usernameIndex)
  }

  app.save(usersCollection)

  const collection = app.findCollectionByNameOrId('expenses')
  const fields = collection.fields || []
  const fieldNames = new Set(fields.map((field) => field.name))

  if (!fieldNames.has('user')) {
    fields.add(new RelationField({
      name: 'user',
      required: true,
      collectionId: '_pb_users_auth_',
      cascadeDelete: true,
      minSelect: 1,
      maxSelect: 1
    }))
  }

  collection.listRule = '@request.auth.id != "" && user = @request.auth.id'
  collection.viewRule = '@request.auth.id != "" && user = @request.auth.id'
  collection.createRule = '@request.auth.id != "" && user = @request.auth.id'
  collection.updateRule = '@request.auth.id != "" && user = @request.auth.id'
  collection.deleteRule = '@request.auth.id != "" && user = @request.auth.id'

  return app.save(collection)
}, (app) => {
  const usersCollection = app.findCollectionByNameOrId('_pb_users_auth_')

  usersCollection.passwordAuth = usersCollection.passwordAuth || {}
  usersCollection.passwordAuth.identityFields = ['email']
  usersCollection.fields = (usersCollection.fields || []).filter((field) => field.name !== 'username')
  usersCollection.indexes = (usersCollection.indexes || []).filter((index) => !index.includes('idx_username__pb_users_auth_'))
  app.save(usersCollection)

  const collection = app.findCollectionByNameOrId('expenses')
  collection.fields = (collection.fields || []).filter((field) => field.name !== 'user')
  collection.listRule = ''
  collection.viewRule = ''
  collection.createRule = ''
  collection.updateRule = ''
  collection.deleteRule = ''
  return app.save(collection)
})
