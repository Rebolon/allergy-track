
const validateProfilesConfig = (e) => {
    const record = e.record;

    const parseJson = (val) => {
        if (!val) return null;
        
        // Robust check for byte array (Uint8Array or similar from Go)
        if (typeof val === 'object' && val !== null && (val.constructor && (val.constructor.name === 'Uint8Array' || val.constructor.name === 'Array' || val.constructor.name === 'Uint8ClampedArray'))) {
            try {
                // Try to convert to string if it looks like a byte array
                let str = "";
                for (let i = 0; i < val.length; i++) {
                    str += String.fromCharCode(val[i]);
                }
                val = str;
            } catch (e) {
                // Not a byte array or conversion failed
            }
        }

        if (typeof val === 'string' && val.trim() !== '') {
            try { return JSON.parse(val); } catch (e) { return null; }
        }
        return val;
    };

    let errors = [];

    // 1. Validation des Protocoles
    let protocols = parseJson(record.get('protocols'));
    if (protocols !== undefined && protocols !== null) {
        if (!Array.isArray(protocols)) {
            errors.push("Les protocoles doivent être un tableau. Reçu: " + (typeof protocols));
        } else if (protocols.length === 0) {
            errors.push("Veuillez définir au moins un protocole médical.");
        } else {
            protocols.forEach((p, index) => {
                if (!p || typeof p !== 'object' || !p.id || !p.allergen || typeof p.dose !== 'number' || typeof p.frequencyDays !== 'number' || !p.createdAt) {
                    errors.push(`Protocole #${index + 1} incomplet (id, allergen, dose, frequencyDays, createdAt requis).`);
                }
            });
        }
    }

    // 2. Validation des Symptômes
    let symptoms = parseJson(record.get('symptoms'));
    if (symptoms !== undefined && symptoms !== null) {
        if (!Array.isArray(symptoms)) {
            errors.push("Les symptômes doivent être un tableau.");
        } else {
            symptoms.forEach((s, index) => {
                if (!s || typeof s !== 'object' || !s.id || !s.label) {
                    errors.push(`Symptôme #${index + 1} incomplet (id, label requis).`);
                }
            });
        }
    }

    if (errors.length > 0) {
        throw new BadRequestError("Validation failed: " + errors.join("; "));
    }

    return e.next();
};

// Register hooks using the discovered names for v0.36.8
onRecordCreateRequest(validateProfilesConfig, "profiles_config");
onRecordUpdateRequest(validateProfilesConfig, "profiles_config");

console.log("!!! Hooks updated successfully for profiles_config");
