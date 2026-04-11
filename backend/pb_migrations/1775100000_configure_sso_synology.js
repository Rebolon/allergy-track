/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
    const dao = new Dao(db);

    const settings = dao.findSettings();

    // Configuration des providers OAuth2
    // On utilise les variables d'environnement injectées dans Docker
    settings.authProviders.update([
        {
            name: "synology",
            displayName: "Synology OIDC",
            enabled: true,
            clientId: process.env.SYNOLOGY_CLIENT_ID || "",
            clientSecret: process.env.SYNOLOGY_CLIENT_SECRET || "",
            authUrl: process.env.SYNOLOGY_AUTH_URL || "",
            tokenUrl: process.env.SYNOLOGY_TOKEN_URL || "",
            userApiUrl: process.env.SYNOLOGY_USER_INFO_URL || "",
        }
    ]);

    dao.saveSettings(settings);

    // S'assurer que la collection users a les bons champs
    const collection = dao.findCollectionByNameOrId("users");

    const roleField = collection.fields.find(f => f.name === "role");
    if (!roleField) {
        collection.fields.add(new SchemaField({
            name: "role",
            type: "select",
            required: true,
            options: { values: ["Supervision", "Allergique"] }
        }));
    }

    const themeField = collection.fields.find(f => f.name === "themePreference");
    if (!themeField) {
        collection.fields.add(new SchemaField({
            name: "themePreference",
            type: "select",
            required: true,
            options: { values: ["flashy", "classic"] }
        }));
    }

    dao.saveCollection(collection);
}, (db) => {
    // Revert logic if needed
})
