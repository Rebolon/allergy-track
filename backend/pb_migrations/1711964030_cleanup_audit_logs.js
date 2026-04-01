// 1711964030_cleanup_audit_logs.js
migrate((app) => {
    try {
        const collection = app.findCollectionByNameOrId("audit_logs");
        app.deleteCollection(collection);
    } catch (e) {
        // Collection already deleted or not found
    }
}, (app) => {
    return null;
});
