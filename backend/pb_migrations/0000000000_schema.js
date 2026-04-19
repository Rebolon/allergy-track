/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    // In migrations, the application instance is passed as the first argument to the migrate callback.
    // Use 'app' instead of the global '$app'.
    
    let jsonData;
    try {
        jsonData = $os.readFile("/srv/schema.json");
    } catch (e) {
        // Fallback for different environments if needed
        jsonData = $os.readFile("./backend/schema.json");
    }
    
    const collections = JSON.parse(String.fromCharCode(...jsonData));

    // Import the collections
    // The second argument 'deleteMissing' can be true if we want the schema to be exactly as in the file.
    // However, it's safer to use false if we don't want to accidentally delete other collections.
    // But for a 'reset-db', true makes sense to have a clean state.
    return app.importCollections(collections, true);
}, (app) => {
    // Rollback logic (optional)
});
