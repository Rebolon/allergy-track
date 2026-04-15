migrate((app) => {
    const users = app.findCollectionByNameOrId("users");
    
    // Suppression du champ legacy profile_accesses
    users.fields = users.fields.filter(f => f.name !== "profile_accesses");
    
    app.save(users);
    console.log("Deleted legacy profile_accesses field from users collection.");
}, (app) => {
    return null;
});
