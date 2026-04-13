// 1775500000_restrict_profile_rules.js
migrate((app) => {
    // 1. Secure 'profiles' - Only owner can update/delete
    const profiles = app.findCollectionByNameOrId("profiles");
    if (profiles) {
        profiles.updateRule = "ownerId = @request.auth.id";
        profiles.deleteRule = "ownerId = @request.auth.id";
        app.save(profiles);
    }

    // 2. Secure 'profiles_config' - Only owner of the linked profile can access
    const configs = app.findCollectionByNameOrId("profiles_config");
    if (configs) {
        // We use relation expand syntax for rules
        configs.listRule = "profileId.ownerId = @request.auth.id";
        configs.viewRule = "profileId.ownerId = @request.auth.id";
        configs.createRule = "@request.auth.id != ''"; // Allow creating (might need more logic but standard for now)
        configs.updateRule = "profileId.ownerId = @request.auth.id";
        configs.deleteRule = "profileId.ownerId = @request.auth.id";
        app.save(configs);
    }
}, (app) => {
    return null;
});
