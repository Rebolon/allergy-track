// 1775200000_add_profiles_config.js
migrate((app) => {
    const collection = new Collection({
        "name": "profiles_config",
        "type": "base",
        "system": false,
        "schema": [
            {
                "name": "profileId",
                "type": "text",
                "required": true,
                "unique": true,
                "options": {
                    "min": null,
                    "max": null,
                    "pattern": ""
                }
            },
            {
                "name": "protocols",
                "type": "json",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {}
            },
            {
                "name": "startDate",
                "type": "text",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {}
            },
            {
                "name": "symptoms",
                "type": "json",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {}
            },
            {
                "name": "medicsShields",
                "type": "json",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {}
            }
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "",
        "updateRule": "",
        "deleteRule": ""
    });

    return app.saveCollection(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("profiles_config");
    if (collection) {
        return app.deleteCollection(collection);
    }
    return null;
});