
const validateProfilesConfig = (e) => {
    const record = e.record;

    const data = e.data; // Les données qui sont sur le point d'être sauvegardées
    let errors = [];

    // 1. Validation des Protocoles : doit être un tableau non vide.
    if (!data.protocols || !Array.isArray(data.protocols)) {
        errors.push("Les protocoles doivent être un tableau.");
    } else if (data.protocols.length === 0) {
        // On suppose que les protocoles sont requis pour un profil actif/complet.
        errors.push("Veuillez définir au moins un protocole médical.");
    }

    // 2. Validation des Symptômes : doit être un tableau (peut être vide).
    if (!data.symptoms || !Array.isArray(data.symptoms)) {
        errors.push("Les symptômes doivent être un tableau.");
    } else if (typeof data.symptoms !== 'object' && data.symptoms !== null) {
        // Si le champ est présent mais pas un objet JSON valide, c'est une erreur de type.
        errors.push("Le champ des symptômes doit être un tableau JSON []");
    }

    // 3. Validation des Boucliers Magiques (MedicsShields): doit être un tableau.
    if (!data.medicsShields || !Array.isArray(data.medicsShields)) {
        errors.push("Les boucliers magiques doivent être un tableau.");
    }

    if (errors.length > 0) {
        // Lève une erreur pour stopper la sauvegarde en cas de validation échouée
        throw new BadRequestError("Validation failed for profiles_config: " + errors.join(", "));
    }

    return e.next();
};

// Register hooks using the discovered names for v0.36.8
onRecordCreateRequest(validateProfilesConfig, "profiles_config");
onRecordUpdateRequest(validateProfilesConfig, "profiles_config");

console.log("!!! Hooks registered successfully for profiles_config");
