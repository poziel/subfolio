migrate((app) => {
  try {
    app.findCollectionByNameOrId('expensePaymentHistory')
    return
  } catch {
    // Collection does not exist yet.
  }

  const expenseCollection = app.findCollectionByNameOrId('expenses')
  const ownerRule = '@request.auth.id != "" && user = @request.auth.id'
  const collection = new Collection({
    type: 'base',
    name: 'expensePaymentHistory',
    listRule: ownerRule,
    viewRule: ownerRule,
    createRule: ownerRule,
    updateRule: ownerRule,
    deleteRule: ownerRule,
    fields: [
      {
        type: 'relation',
        name: 'user',
        required: true,
        collectionId: '_pb_users_auth_',
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1
      },
      {
        type: 'relation',
        name: 'expense',
        required: true,
        collectionId: expenseCollection.id || 'expenses',
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1
      },
      { type: 'text', name: 'scheduledDate', required: true, max: 20 },
      { type: 'text', name: 'paidDate', required: false, max: 20 },
      { type: 'number', name: 'amount', required: true, min: 0 },
      { type: 'text', name: 'currency', required: true, min: 3, max: 3 },
      { type: 'text', name: 'status', required: false, max: 40 },
      { type: 'text', name: 'source', required: false, max: 80 },
      { type: 'text', name: 'changeType', required: false, max: 80 },
      { type: 'json', name: 'details', required: false },
      { type: 'text', name: 'createdAt', required: false, max: 40 },
      { type: 'text', name: 'updatedAt', required: false, max: 40 }
    ],
    indexes: [
      'CREATE UNIQUE INDEX `idx_expense_payment_history_expense_scheduled` ON `expensePaymentHistory` (`expense`, `scheduledDate`)',
      'CREATE INDEX `idx_expense_payment_history_user_scheduled` ON `expensePaymentHistory` (`user`, `scheduledDate`)'
    ]
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('expensePaymentHistory')
  return app.delete(collection)
})
