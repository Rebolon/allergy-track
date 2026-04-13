migrate((app) => {
    const collection = app.findCollectionByNameOrId("profiles");

    // Ajout du champ onboardingStep
    // Par défaut, nous ne mettons pas de valeur obligatoire ici pour la migration
    // mais la logique applicative l'utilisera.
    collection.fields.push(new TextField({
        "name": "onboardingStep",
        "required": false,
        "options": { "min": null, "max": null, "pattern": "" }
    }));

    return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("profiles");
    
    // Rollback
    collection.fields = collection.fields.filter(f => f.name !== "onboardingStep");
    
    return app.save(collection);
})
