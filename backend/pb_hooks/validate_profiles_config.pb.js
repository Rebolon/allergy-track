
const validateProfilesConfig = (e) => {
    const data = e.data; // Les données qui sont sur le point d'être sauvegardées
    let errors = [];

    // 1. Validation des Protocoles : si présent, doit être un tableau non vide.
    if (data.hasOwnProperty('protocols')) {
        if (!Array.isArray(data.protocols)) {
            errors.push("Les protocoles doivent être un tableau.");
        } else if (data.protocols.length === 0) {
            errors.push("Veuillez définir au moins un protocole médical.");
        }
    }

    // 2. Validation des Symptômes : si présent, doit être un tableau.
    if (data.hasOwnProperty('symptoms')) {
        if (!Array.isArray(data.symptoms)) {
            errors.push("Les symptômes doivent être un tableau.");
        }
    }

    // 3. Validation des Boucliers Magiques (MedicsShields): si présent, doit être un tableau.
    if (data.hasOwnProperty('medicsShields')) {
        if (!Array.isArray(data.medicsShields)) {
            errors.push("Les boucliers magiques doivent être un tableau.");
        }
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
