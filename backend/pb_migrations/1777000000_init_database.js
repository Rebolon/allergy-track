migrate((app) => {
    // Helper pour assurer l'existence d'une collection
    const ensureCol = (name, type = "base") => {
        try {
            return app.findCollectionByNameOrId(name);
        } catch (e) {
            const col = new Collection({ name, type });
            app.save(col);
            return app.findCollectionByNameOrId(name);
        }
    };

    // 1. Assurer les collections (Squelettes)
    const users = ensureCol("users", "auth");
    const profiles = ensureCol("profiles");
    const accesses = ensureCol("accesses");
    const dailyLogs = ensureCol("daily_logs");
    const configs = ensureCol("profiles_config");
    const gami = ensureCol("gamification");
    const invites = ensureCol("invitations");
    const audits = ensureCol("audit_logs");

    // 2. Ajouter les champs (Ordre logique pour les relations)
    
    // USERS
    users.fields.add(new TextField({ name: "name" }));
    users.fields.add(new SelectField({ name: "role", values: ["Allergique", "Supervision"] }));
    users.fields.add(new TextField({ name: "themePreference" }));
    app.save(users);

    // PROFILES
    profiles.fields.add(new TextField({ name: "name", required: true }));
    profiles.fields.add(new TextField({ name: "birthDate" }));
    profiles.fields.add(new TextField({ name: "onboardingStep" }));
    app.save(profiles);

    // ACCESSES
    accesses.fields.add(new RelationField({ name: "userId", required: true, collectionId: users.id, cascadeDelete: true, maxSelect: 1 }));
    accesses.fields.add(new RelationField({ name: "profileId", required: true, collectionId: profiles.id, cascadeDelete: true, maxSelect: 1 }));
    accesses.fields.add(new SelectField({ name: "role", required: true, values: ["owner", "editor", "reader"] }));
    app.save(accesses);

    // DAILY LOGS
    dailyLogs.fields.add(new TextField({ name: "date", required: true }));
    dailyLogs.fields.add(new JSONField({ name: "intakes", required: true }));
    dailyLogs.fields.add(new JSONField({ name: "symptoms", required: true }));
    dailyLogs.fields.add(new JSONField({ name: "treatments", required: true }));
    dailyLogs.fields.add(new TextField({ name: "updatedBy", required: true }));
    dailyLogs.fields.add(new RelationField({ name: "profileId", required: true, collectionId: profiles.id, cascadeDelete: true, maxSelect: 1 }));
    app.save(dailyLogs);

    // CONFIGS
    configs.fields.add(new RelationField({ name: "profileId", required: true, collectionId: profiles.id, cascadeDelete: true, maxSelect: 1 }));
    configs.fields.add(new JSONField({ name: "protocols" }));
    app.save(configs);

    // GAMIFICATION
    gami.fields.add(new RelationField({ name: "profileId", required: true, collectionId: profiles.id, cascadeDelete: true, maxSelect: 1 }));
    gami.fields.add(new NumberField({ name: "totalStreakPoints" }));
    app.save(gami);

    // 3. Appliquer les RÈGLES (Dernière étape une fois que tout le monde se connaît)
    users.listRule = "id = @request.auth.id";
    app.save(users);

    profiles.listRule = "@collection.accesses.profileId ?= id && @collection.accesses.userId ?= @request.auth.id";
    profiles.viewRule = "@collection.accesses.profileId ?= id && @collection.accesses.userId ?= @request.auth.id";
    app.save(profiles);

    accesses.listRule = "@request.auth.id != '' && userId = @request.auth.id";
    app.save(accesses);

    dailyLogs.listRule = "@collection.accesses.profileId ?= profileId && @collection.accesses.userId ?= @request.auth.id";
    app.save(dailyLogs);

}, (app) => null);
