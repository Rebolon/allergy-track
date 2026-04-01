// 1711964020_init_everything.js
migrate((app) => {
    const collections = [
        {
            "name": "daily_logs",
            "type": "base",
            "listRule": "",
            "viewRule": "",
            "createRule": "",
            "updateRule": "",
            "fields": [
                { "id": "text3208210256", "name": "id", "type": "text", "required": true, "unique": true, "system": true, "min": 15, "max": 15, "pattern": "^[a-z0-9]+$", "autogeneratePattern": "[a-z0-9]{15}" },
                { "id": "externalId", "name": "externalId", "type": "text", "unique": true },
                { "id": "date", "name": "date", "type": "text", "required": true },
                { "id": "intakes", "name": "intakes", "type": "json", "required": true },
                { "id": "symptoms", "name": "symptoms", "type": "json", "required": true },
                { "id": "treatments", "name": "treatments", "type": "json", "required": true },
                { "id": "note", "name": "note", "type": "text" },
                { "id": "updatedBy", "name": "updatedBy", "type": "text", "required": true },
                { "id": "autodate2990389176", "name": "created", "onCreate": true, "onUpdate": false, "system": true, "type": "autodate" },
                { "id": "autodate3332085445", "name": "updated", "onCreate": true, "onUpdate": true, "system": true, "type": "autodate" }
            ]
        }
    ];

    app.importCollections(collections, true);
}, (app) => {
    return null;
});
