// pb_hooks/validate_daily_logs.pb.js

const validateDailyLog = (e) => {
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

    // --- Validate 'intakes' ---
    let intakes = parseJson(record.get("intakes"));
    if (!intakes || !Array.isArray(intakes) || intakes.length === 0) {
        throw new BadRequestError("La propriété 'intakes' doit être un tableau non vide.");
    }

    // --- Validate 'treatments' ---
    let treatments = parseJson(record.get("treatments"));
    if (!treatments || !Array.isArray(treatments) || treatments.length === 0) {
       throw new BadRequestError("La propriété 'treatments' doit être un tableau non vide.");
    }

    // --- Validate 'symptoms' ---
    let symptoms = parseJson(record.get("symptoms"));
    if (!symptoms || !Array.isArray(symptoms)) {
        throw new BadRequestError("La propriété 'symptoms' doit être un tableau.");
    }

    return e.next();
};

// Register hooks using the discovered names for v0.36.8
onRecordCreateRequest(validateDailyLog, "daily_logs");
onRecordUpdateRequest(validateDailyLog, "daily_logs");

console.log("!!! Hooks registered successfully for daily_logs");
