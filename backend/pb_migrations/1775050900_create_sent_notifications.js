/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);
  const collection = new Collection({
    name: 'sent_notifications',
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
        id: 'notification_date',
        name: 'notificationDate',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: { min: null, max: null, pattern: '' }
      },
      {
        system: false,
        id: 'notification_type',
        name: 'notificationType',
        type: 'select',
        required: true,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          values: ['daily_reminder', 'streak_warning', 'perfect_achievement', 'custom']
        }
      },
      {
        system: false,
        id: 'sent_at',
        name: 'sentAt',
        type: 'date',
        required: true,
        presentable: false,
        unique: false,
        options: { min: '', max: '' }
      },
      {
        system: false,
        id: 'payload',
        name: 'payload',
        type: 'json',
        required: false,
        presentable: false,
        unique: false,
        options: {}
      }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_sent_notif_user_date_type ON sent_notifications (userId, notificationDate, notificationType)'
    ]
  });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  return dao.deleteCollection('sent_notifications');
})
