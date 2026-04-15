migrate((app) => {
    const profiles = app.findCollectionByNameOrId("profiles");

    // 1. Gestion de 'accesses'
    let accesses;
    try {
        accesses = app.findCollectionByNameOrId("accesses");
    } catch (e) {
        accesses = new Collection({
            "name": "accesses",
            "type": "base",
            "fields": [
                {
                    "name": "userId",
                    "type": "relation",
                    "required": true,
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": true,
                    "maxSelect": 1
                },
                {
                    "name": "profileId",
                    "type": "relation",
                    "required": true,
                    "collectionId": profiles.id,
                    "cascadeDelete": true,
                    "maxSelect": 1
                },
                {
                    "name": "role",
                    "type": "select",
                    "required": true,
                    "values": ["owner", "editor", "reader"],
                    "maxSelect": 1
                }
            ],
            "listRule": "@request.auth.id != '' && userId = @request.auth.id",
            "viewRule": "@request.auth.id != '' && userId = @request.auth.id"
        });
        app.save(accesses);
    }

    // 2. Mise à jour de 'profiles'
    profiles.fields = profiles.fields.filter(f => f.name !== "ownerId");
    
    profiles.listRule = "@collection.accesses.profileId ?= id && @collection.accesses.userId ?= @request.auth.id";
    profiles.viewRule = "@collection.accesses.profileId ?= id && @collection.accesses.userId ?= @request.auth.id";
    profiles.updateRule = "@collection.accesses.profileId ?= id && @collection.accesses.userId ?= @request.auth.id && (@collection.accesses.role = 'owner' || @collection.accesses.role = 'editor')";
    profiles.deleteRule = "@collection.accesses.profileId ?= id && @collection.accesses.userId ?= @request.auth.id && @collection.accesses.role = 'owner'";
    
    app.save(profiles);

    // 3. Mise à jour de 'daily_logs'
    const dailyLogs = app.findCollectionByNameOrId("daily_logs");
    if (dailyLogs) {
        const hasProfileId = dailyLogs.fields.some(f => f.name === "profileId");
        if (!hasProfileId) {
            dailyLogs.fields.push({
                "name": "profileId",
                "type": "relation",
                "required": true,
                "collectionId": profiles.id,
                "cascadeDelete": true,
                "maxSelect": 1
            });
        }

        // CORRECTED RULES
        dailyLogs.listRule = "@collection.accesses.profileId ?= profileId && @collection.accesses.userId ?= @request.auth.id";
        dailyLogs.viewRule = "@collection.accesses.profileId ?= profileId && @collection.accesses.userId ?= @request.auth.id";
        // To allow creating: must have owner/editor access to the profile referred to in the NEW record's profileId field
        dailyLogs.createRule = "@request.auth.id != '' && @collection.accesses.profileId ?= profileId && @collection.accesses.userId ?= @request.auth.id && (@collection.accesses.role = 'owner' || @collection.accesses.role = 'editor')";
        dailyLogs.updateRule = "@collection.accesses.profileId ?= profileId && @collection.accesses.userId ?= @request.auth.id && (@collection.accesses.role = 'owner' || @collection.accesses.role = 'editor')";

        app.save(dailyLogs);
    }

}, (app) => {
    return null;
});
