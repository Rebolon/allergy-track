// backend/pb_hooks/validate_profile_access.pb.js

onRecordBeforeDeleteRequest((e) => {
    // We only care about the 'profiles' collection here
    if (e.collection.name !== "profiles") {
        return;
    }

    const record = e.record;
    const auth = e.httpContext.get("authRecord"); // v0.23+ uses authRecord
    
    if (!auth) {
        throw new ForbiddenError("Authentification requise pour cette opération.");
    }

    // Double check ownership (even if rules are in place, hooks provide better logs/errors)
    if (record.get("ownerId") !== auth.id) {
        throw new ForbiddenError("Seul le propriétaire de ce dossier médical peut le supprimer.");
    }

    // Business Logic: Don't allow deleting a completed profile if it's the ONLY one?
    // User response was: "uniquement si on est le propriétaire", so we follow that strictly.
}, "profiles");
