migrate((app) => {
    try {
        // Vérifier si la collection existe déjà
        app.findCollectionByNameOrId("users");
        return;
    } catch (e) {
        // La collection n'existe pas, on la crée
    }

    const collection = new Collection({
        "id": "_pb_users_auth_",
        "name": "users",
        "type": "auth",
        "system": false,
        "fields": [
            {
                "name": "name",
                "type": "text",
                "required": false,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "avatar",
                "type": "file",
                "required": false,
                "options": { 
                    "maxSelect": 1, 
                    "maxSize": 5242880, 
                    "mimeTypes": ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"], 
                    "thumbs": null, 
                    "protected": false 
                }
            }
        ],
        "listRule": "id = @request.auth.id",
        "viewRule": "id = @request.auth.id",
        "createRule": "",
        "updateRule": "id = @request.auth.id",
        "deleteRule": "id = @request.auth.id",
        "authOptions": {
            "allowEmailAuth": true,
            "allowOAuth2Auth": true,
            "allowUsernameAuth": true,
            "requireEmail": false
        }
    });

    return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("users");
    if (collection) {
        return app.deleteCollection(collection);
    }
})
