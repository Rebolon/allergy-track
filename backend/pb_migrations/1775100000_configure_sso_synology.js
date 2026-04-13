migrate((app) => {
    const collection = app.findCollectionByNameOrId("users");

    // Configuration des providers OAuth2 dans les options de la collection
    const clientId = $os.getenv("SYNOLOGY_CLIENT_ID");
    const clientSecret = $os.getenv("SYNOLOGY_CLIENT_SECRET");

    if (clientId && clientSecret) {
        collection.oauth2.enabled = true;
        collection.oauth2.providers = [
            {
                name: "oidc",
                displayName: "Synology OIDC",
                clientId: clientId,
                clientSecret: clientSecret,
                authUrl: $os.getenv("SYNOLOGY_AUTH_URL") || "",
                tokenUrl: $os.getenv("SYNOLOGY_TOKEN_URL") || "",
                userApiUrl: $os.getenv("SYNOLOGY_USER_INFO_URL") || "",
            }
        ];
    }

    // S'assurer que la collection users a les bons champs (API v0.23+)
    const roleField = collection.fields.find(f => f.name === "role");
    if (!roleField) {
        collection.fields.push(new SelectField({
            name: "role",
            required: true,
            values: ["Supervision", "Allergique"]
        }));
    }

    const themeField = collection.fields.find(f => f.name === "themePreference");
    if (!themeField) {
        collection.fields.push(new SelectField({
            name: "themePreference",
            required: true,
            values: ["flashy", "classic"]
        }));
    }

    app.save(collection);
}, (app) => {
    // Revert logic if needed
})
