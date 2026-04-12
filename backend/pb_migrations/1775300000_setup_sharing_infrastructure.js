migrate((app) => {
    // 1. Création de la collection 'profiles'
    const profilesCollection = new Collection({
        "name": "profiles",
        "type": "base",
        "system": false,
        "schema": [
            {
                "name": "name",
                "type": "text",
                "required": true,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "birthDate",
                "type": "text",
                "required": false,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "avatar",
                "type": "text",
                "required": false,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "avatarSkinTone",
                "type": "text",
                "required": false,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "themePreference",
                "type": "text",
                "required": false,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "ownerId",
                "type": "relation",
                "required": true,
                "options": {
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": true,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": null
                }
            }
        ],
        "listRule": "@request.auth.id != ''",
        "viewRule": "@request.auth.id != ''",
        "createRule": "@request.auth.id != ''",
        "updateRule": "@request.auth.id != ''",
        "deleteRule": "@request.auth.id != ''"
    });

    app.saveCollection(profilesCollection);

    // 2. Création de la collection 'invitations'
    const invitationsCollection = new Collection({
        "name": "invitations",
        "type": "base",
        "system": false,
        "schema": [
            {
                "name": "code",
                "type": "text",
                "required": true,
                "unique": true,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "profileId",
                "type": "relation",
                "required": true,
                "options": {
                    "collectionId": profilesCollection.id,
                    "cascadeDelete": true,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": null
                }
            },
            {
                "name": "permission",
                "type": "text",
                "required": true,
                "options": { "min": null, "max": null, "pattern": "" }
            },
            {
                "name": "expiresAt",
                "type": "date",
                "required": true,
                "options": { "min": "", "max": "" }
            },
            {
                "name": "usedBy",
                "type": "relation",
                "required": false,
                "options": {
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": false,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": null
                }
            }
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "@request.auth.id != ''",
        "updateRule": "@request.auth.id != ''",
        "deleteRule": "@request.auth.id != ''"
    });

    app.saveCollection(invitationsCollection);

    // 3. Mise à jour de la collection 'users'
    const usersCollection = app.findCollectionByNameOrId("users");
    
    // Ajout de profile_accesses
    usersCollection.schema.addField(new SchemaField({
        "name": "profile_accesses",
        "type": "json",
        "required": false
    }));

    app.saveCollection(usersCollection);

    // 4. Mise à jour de 'profiles_config'
    const profilesConfigCollection = app.findCollectionByNameOrId("profiles_config");
    if (profilesConfigCollection) {
        // Suppression de l'ancien champ text profileId
        const oldField = profilesConfigCollection.schema.fields.find(f => f.name === "profileId");
        if (oldField) {
            profilesConfigCollection.schema.removeField(oldField.id);
        }
        
        // Ajout du nouveau champ relation profileId
        profilesConfigCollection.schema.addField(new SchemaField({
            "name": "profileId",
            "type": "relation",
            "required": true,
            "options": {
                "collectionId": profilesCollection.id,
                "cascadeDelete": true,
                "minSelect": null,
                "maxSelect": 1,
                "displayFields": null
            }
        }));

        app.saveCollection(profilesConfigCollection);
    }

}, (app) => {
    return null;
})
