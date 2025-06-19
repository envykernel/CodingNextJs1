-- Convert existing history_type values to match the new enum
UPDATE patient_medical_history 
SET history_type = 'ALLERGY' 
WHERE history_type = 'Allergie';

UPDATE patient_medical_history 
SET history_type = 'CHRONIC_DISEASE' 
WHERE history_type = 'Maladie chronique';

UPDATE patient_medical_history 
SET history_type = 'SURGERY' 
WHERE history_type = 'Chirurgie';

UPDATE patient_medical_history 
SET history_type = 'HOSPITALIZATION' 
WHERE history_type = 'Hospitalisation';

UPDATE patient_medical_history 
SET history_type = 'FAMILY_HISTORY' 
WHERE history_type = 'Antécédents familiaux';

UPDATE patient_medical_history 
SET history_type = 'VACCINATION' 
WHERE history_type = 'Vaccination';

-- Set any remaining unknown values to OTHER
UPDATE patient_medical_history 
SET history_type = 'OTHER' 
WHERE history_type NOT IN ('ALLERGY', 'CHRONIC_DISEASE', 'SURGERY', 'HOSPITALIZATION', 'FAMILY_HISTORY', 'VACCINATION', 'OTHER'); 
