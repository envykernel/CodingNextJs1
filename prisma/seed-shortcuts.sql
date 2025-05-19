-- First, ensure we don't have duplicate entries
DELETE FROM "ShortcutReference" WHERE url IN (
  '/apps/patients/list',
  '/apps/appointments/list',
  '/apps/appointments/add',
  '/apps/patients/add',
  '/apps/invoice/list',
  '/pages/account-settings'
);

-- Insert the default shortcuts
INSERT INTO "ShortcutReference" (
  url,
  icon,
  title,
  subtitle,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES
  (
    '/apps/patients/list',
    'tabler-users',
    'List of Patients',
    'View all patients',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '/apps/appointments/list',
    'tabler-calendar',
    'List of Appointments',
    'View all appointments',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '/apps/appointments/add',
    'tabler-calendar-plus',
    'Add New Appointment',
    'Schedule new appointment',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '/apps/patients/add',
    'tabler-user-plus',
    'Add New Patient',
    'Register new patient',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '/apps/invoice/list',
    'tabler-file-dollar',
    'List of Invoices',
    'Manage invoices',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '/pages/account-settings',
    'tabler-settings',
    'Settings',
    'Account Settings',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- Create a function to assign default shortcuts to a user
CREATE OR REPLACE FUNCTION assign_default_shortcuts_to_user(user_id INT)
RETURNS void AS $$
DECLARE
    shortcut_record RECORD;
    display_order INT := 0;
BEGIN
    -- Delete existing shortcuts for the user
    DELETE FROM "UserShortcut" WHERE "userId" = user_id;
    
    -- Insert all active shortcuts for the user
    FOR shortcut_record IN 
        SELECT id FROM "ShortcutReference" WHERE "isActive" = true ORDER BY id
    LOOP
        INSERT INTO "UserShortcut" (
            "userId",
            "shortcutId",
            "displayOrder",
            "isActive",
            "createdAt",
            "updatedAt"
        ) VALUES (
            user_id,
            shortcut_record.id,
            display_order,
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        display_order := display_order + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Example usage to assign shortcuts to a specific user (replace USER_ID with actual user ID):
-- SELECT assign_default_shortcuts_to_user(USER_ID);

-- To assign shortcuts to all existing users:
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM "UserInternal"
    LOOP
        PERFORM assign_default_shortcuts_to_user(user_record.id);
    END LOOP;
END;
$$; 
