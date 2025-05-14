-- First, verify that doctor with ID 1 exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM doctor WHERE id = 1) THEN
        RAISE EXCEPTION 'Doctor with ID 1 does not exist. Please ensure a doctor with ID 1 exists before running this script.';
    END IF;
END $$;

-- Update all patients to have doctor_id = 1
UPDATE patient 
SET doctor = (SELECT name FROM doctor WHERE id = 1)
WHERE doctor IS NOT NULL;

-- Log the number of updated records
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % patients to have doctor_id = 1', updated_count;
END $$; 
