migrate((app) => {
    // 1. Création de la collection 'profiles'
    const profilesCollection = new Collection({
        "name": "profiles",
        "type": "base",
        "system": false,
        "fields": [
            {
                "name": "name",
                "type": "text",
                "required": true,
            },
            {
                "name": "birthDate",
                "type": "text",
                "required": false,
            },
            {
                "name": "avatar",
                "type": "text",
                "required": false,
            },
            {
                "name": "avatarSkinTone",
                "type": "text",
                "required": false,
            },
            {
                "name": "themePreference",
                "type": "text",
                "required": false,
            },
            {
                "name": "ownerId",
                "type": "relation",
                "required": true,
                "collectionId": "_pb_users_auth_",
                "cascadeDelete": true,
                "maxSelect": 1,
            }
        ],
        "listRule": "@request.auth.id != ''",
        "viewRule": "@request.auth.id != ''",
        "createRule": "@request.auth.id != ''",
        "updateRule": "@request.auth.id != ''",
        "deleteRule": "@request.auth.id != ''"
    });

    app.save(profilesCollection);

    // 2. Création de la collection 'invitations'
    const invitationsCollection = new Collection({
        "name": "invitations",
        "type": "base",
        "system": false,
        "fields": [
            {
                "name": "code",
                "type": "text",
                "required": true,
                "unique": true,
            },
            {
                "name": "profileId",
                "type": "relation",
                "required": true,
                "collectionId": profilesCollection.id,
                "cascadeDelete": true,
                "maxSelect": 1,
            },
            {
                "name": "permission",
                "type": "text",
                "required": true,
            },
            {
                "name": "expiresAt",
                "type": "date",
                "required": true,
            },
            {
                "name": "usedBy",
                "type": "relation",
                "required": false,
                "collectionId": "_pb_users_auth_",
                "cascadeDelete": false,
                "maxSelect": 1,
            }
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "@request.auth.id != ''",
        "updateRule": "@request.auth.id != ''",
        "deleteRule": "@request.auth.id != ''"
    });

    app.save(invitationsCollection);

    // 3. Mise à jour de la collection 'users'
    const usersCollection = app.findCollectionByNameOrId("users");
    
    // Ajout de profile_accesses (API v0.23+)
    usersCollection.fields.push(new JSONField({
        "name": "profile_accesses",
        "required": false
    }));

    app.save(usersCollection);

    // 4. Mise à jour de 'profiles_config'
    const profilesConfigCollection = app.findCollectionByNameOrId("profiles_config");
    if (profilesConfigCollection) {
        // Suppression de l'ancien champ text profileId (API v0.23+)
        profilesConfigCollection.fields = profilesConfigCollection.fields.filter(f => f.name !== "profileId");
        
        // Ajout du nouveau champ relation profileId
        profilesConfigCollection.fields.push(new RelationField({
            "name": "profileId",
            "type": "relation",
            "required": true,
            "collectionId": profilesCollection.id,
            "cascadeDelete": true,
            "maxSelect": 1,
        }));

        app.save(profilesConfigCollection);
    }

}, (app) => {
    return null;
})
