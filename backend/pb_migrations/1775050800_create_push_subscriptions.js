/// <reference path="../pb_data/types.d.ts" />

/// <reference path="../pb_hooks/validate_daily_logs.pb.js" />

migrate((db) => {
  const dao = new Dao(db);
  const collection = new Collection({
    name: 'push_subscriptions',
    type: 'base',
    schema: [
      {
        system: false,
        id: 'user_id',
        name: 'userId',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: { min: null, max: null, pattern: '' }
      },
      {
        system: false,
        id: 'endpoint',
        name: 'endpoint',
        type: 'url',
        required: true,
        presentable: false,
        unique: false,
        options: { exclude: [] }
      },
      {
        system: false,
        id: 'keys',
        name: 'keys',
        type: 'json',
        required: true,
        presentable: false,
        unique: false,
        options: {}
      },
      {
        system: false,
        id: 'expiration_time',
        name: 'expirationTime',
        type: 'number',
        required: false,
        presentable: false,
        unique: false,
        options: { min: null, max: null }
      },
      {
        system: false,
        id: 'created',
        name: 'created',
        type: 'date',
        required: false,
        presentable: false,
        unique: false,
        options: { min: '', max: '' }
      }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_push_user_endpoint ON push_subscriptions (userId, endpoint)'
    ]
  });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  return dao.deleteCollection('push_subscriptions');
})
