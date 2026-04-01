// pb_hooks/validate_daily_logs.pb.js

const validateDailyLog = (e) => {
    const record = e.record;

    const parseJson = (val) => {
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
       // Note: we allow empty treatments if the user wants to signify no treatment, 
       // but here we follow the original logic of 'required' fields from schema.
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
