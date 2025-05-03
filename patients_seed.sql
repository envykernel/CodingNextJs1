-- Empty all related tables before inserting new data
TRUNCATE TABLE patient_measurements CASCADE;
TRUNCATE TABLE patient_medical_history CASCADE;
TRUNCATE TABLE patient_medical CASCADE;
TRUNCATE TABLE patient CASCADE;
TRUNCATE TABLE patient_appointment CASCADE;
TRUNCATE TABLE doctor CASCADE;
TRUNCATE TABLE organisation CASCADE;

-- Reset patient id sequence to start from 1
ALTER SEQUENCE patient_id_seq RESTART WITH 1;

-- PostgreSQL script to seed 45 patients with Arabic names (in English characters) and related data
-- Assumes IDs are sequential from 1 to 45

BEGIN;

-- Create Organisation, Doctor, and Patient Appointment tables for multi-tenant support
CREATE TABLE IF NOT EXISTS organisation (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'enabled', -- e.g., enabled, disabled, pending, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS patient CASCADE;
CREATE TABLE IF NOT EXISTS patient (
    id SERIAL PRIMARY KEY,
    organisation_id INTEGER NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    doctor VARCHAR(100),
    status VARCHAR(50),
    avatar VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    phone_number VARCHAR(30),
    email VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    emergency_contact_email VARCHAR(100),
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_organisation_id ON patient(organisation_id);

-- Create the first organisation for multi-tenant support
INSERT INTO organisation (id, name, address, phone_number, email, status, created_at, updated_at)
VALUES (1, 'Organisation Dr.Samia', '123 Main St', '+1234567890', 'contact@drsamia.org', 'enabled', NOW(), NOW());

-- Insert patients
INSERT INTO patient (id, organisation_id, name, birthdate, gender, doctor, status, avatar, address, city, phone_number, email, emergency_contact_name, emergency_contact_phone, emergency_contact_email, created_at, updated_at)
VALUES
  (1,  1, 'Ahmad Ali',      '1985-03-12', 'male', 'Dr. Sami Youssef', 'enabled', NULL, '12 Victory St', 'Riyadh', '0501234567', 'ahmad.ali1@email.com', 'Khaled Ali', '0507654321', 'khaled.ali@email.com', NOW(), NOW()),
  (2,  1, 'Fatima Zahra',   '1990-07-25', 'female', 'Dr. Laila Hassan', 'disabled', NULL, '8 Queen St', 'Jeddah', '0552345678', 'fatima.zahra@email.com', 'Sara Zahra', '0558765432', 'sara.zahra@email.com', NOW(), NOW()),
  (3,  1, 'Mohamed Said',   '1978-11-02', 'male', 'Dr. Emad Kamal', 'blocked', NULL, '22 Freedom St', 'Mecca', '0533456789', 'mohamed.said@email.com', 'Said Mohamed', '0539876543', 'said.mohamed@email.com', NOW(), NOW()),
  (4,  1, 'Salma Hassan',   '1982-05-18', 'female', 'Dr. Mona Abdullah', 'pending', NULL, '5 Flowers St', 'Dammam', '0544567890', 'salma.hassan@email.com', 'Hassan Ali', '0540987654', 'hassan.ali@email.com', NOW(), NOW()),
  (5,  1, 'Youssef Ibrahim','1995-09-30', 'male', 'Dr. Sami Youssef', 'enabled', NULL, '10 Noor St', 'Riyadh', '0505678901', 'youssef.ibrahim@email.com', 'Ibrahim Youssef', '0501987654', 'ibrahim.youssef@email.com', NOW(), NOW()),
  (6,  1, 'Mariam Khaled',  '1988-12-14', 'female', 'Dr. Laila Hassan', 'disabled', NULL, '3 Spring St', 'Jeddah', '0556789012', 'mariam.khaled@email.com', 'Khaled Mariam', '0552987654', 'khaled.mariam@email.com', NOW(), NOW()),
  (7,  1, 'Ali Hussein',    '1975-01-22', 'male', 'Dr. Emad Kamal', 'blocked', NULL, '7 Dawn St', 'Mecca', '0537890123', 'ali.hussein@email.com', 'Hussein Ali', '0533987654', 'hussein.ali@email.com', NOW(), NOW()),
  (8,  1, 'Huda Abdullah',  '1983-04-09', 'female', 'Dr. Mona Abdullah', 'pending', NULL, '15 Hope St', 'Dammam', '0548901234', 'huda.abdullah@email.com', 'Abdullah Huda', '0544987654', 'abdullah.huda@email.com', NOW(), NOW()),
  (9,  1, 'Saeed Mahmoud',  '1992-08-27', 'male', 'Dr. Sami Youssef', 'enabled', NULL, '18 Sunrise St', 'Riyadh', '0509012345', 'saeed.mahmoud@email.com', 'Mahmoud Saeed', '0505987654', 'mahmoud.saeed@email.com', NOW(), NOW()),
  (10, 1, 'Leila Omar',     '1986-02-16', 'female', 'Dr. Laila Hassan', 'disabled', NULL, '2 Breeze St', 'Jeddah', '0550123456', 'leila.omar@email.com', 'Omar Leila', '0556987654', 'omar.leila@email.com', NOW(), NOW()),
  (11, 1, 'Omar Nasser',    '1981-06-10', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '11 Palm St', 'Riyadh', '0501122334', 'omar.nasser@email.com', 'Nasser Omar', '0504433221', 'nasser.omar@email.com', NOW(), NOW()),
  (12, 1, 'Amina Fathi',    '1993-09-19', 'female', 'Dr. Laila Hassan', 'pending', NULL, '19 Lotus St', 'Jeddah', '0552233445', 'amina.fathi@email.com', 'Fathi Amina', '0555544332', 'fathi.amina@email.com', NOW(), NOW()),
  (13, 1, 'Hassan Tarek',   '1987-12-23', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '23 Olive St', 'Mecca', '0533344556', 'hassan.tarek@email.com', 'Tarek Hassan', '0536655443', 'tarek.hassan@email.com', NOW(), NOW()),
  (14, 1, 'Rania Adel',     '1991-03-05', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '5 Jasmine St', 'Dammam', '0544455667', 'rania.adel@email.com', 'Adel Rania', '0547766554', 'adel.rania@email.com', NOW(), NOW()),
  (15, 1, 'Khaled Samir',   '1984-08-29', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '29 Cedar St', 'Riyadh', '0505566778', 'khaled.samir@email.com', 'Samir Khaled', '0508877665', 'samir.khaled@email.com', NOW(), NOW()),
  (16, 1, 'Nour Hani',      '1996-11-11', 'female', 'Dr. Laila Hassan', 'pending', NULL, '11 Sunflower St', 'Jeddah', '0556677889', 'nour.hani@email.com', 'Hani Nour', '0559988776', 'hani.nour@email.com', NOW(), NOW()),
  (17, 1, 'Tariq Fadel',    '1979-02-14', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '14 Maple St', 'Mecca', '0537788990', 'tariq.fadel@email.com', 'Fadel Tariq', '0530099887', 'fadel.tariq@email.com', NOW(), NOW()),
  (18, 1, 'Dina Samir',     '1985-05-21', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '21 Pine St', 'Dammam', '0548899001', 'dina.samir@email.com', 'Samir Dina', '0541100998', 'samir.dina@email.com', NOW(), NOW()),
  (19, 1, 'Majed Adel',     '1994-10-13', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '13 Oak St', 'Riyadh', '0509900112', 'majed.adel@email.com', 'Adel Majed', '0502211009', 'adel.majed@email.com', NOW(), NOW()),
  (20, 1, 'Yasmin Fathi',   '1989-01-27', 'female', 'Dr. Laila Hassan', 'pending', NULL, '27 Rose St', 'Jeddah', '0551011122', 'yasmin.fathi@email.com', 'Fathi Yasmin', '0553322110', 'fathi.yasmin@email.com', NOW(), NOW()),
  (21, 1, 'Samir Nabil',    '1982-04-15', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '15 Tulip St', 'Mecca', '0532122233', 'samir.nabil@email.com', 'Nabil Samir', '0534343212', 'nabil.samir@email.com', NOW(), NOW()),
  (22, 1, 'Hiba Khalil',    '1997-07-08', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '8 Daisy St', 'Dammam', '0543233344', 'hiba.khalil@email.com', 'Khalil Hiba', '0545454323', 'khalil.hiba@email.com', NOW(), NOW()),
  (23, 1, 'Fadi Zaki',      '1980-10-19', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '19 Lily St', 'Riyadh', '0504344455', 'fadi.zaki@email.com', 'Zaki Fadi', '0506565434', 'zaki.fadi@email.com', NOW(), NOW()),
  (24, 1, 'Lina Nasser',    '1992-02-03', 'female', 'Dr. Laila Hassan', 'pending', NULL, '3 Orchid St', 'Jeddah', '0555454567', 'lina.nasser@email.com', 'Nasser Lina', '0557676545', 'nasser.lina@email.com', NOW(), NOW()),
  (25, 1, 'Adel Fathi',     '1986-06-17', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '17 Ivy St', 'Mecca', '0536565678', 'adel.fathi@email.com', 'Fathi Adel', '0538787656', 'fathi.adel@email.com', NOW(), NOW()),
  (26, 1, 'Sara Tarek',     '1991-09-29', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '29 Fern St', 'Dammam', '0547676789', 'sara.tarek@email.com', 'Tarek Sara', '0549898767', 'tarek.sara@email.com', NOW(), NOW()),
  (27, 1, 'Nabil Hossam',   '1983-12-12', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '12 Elm St', 'Riyadh', '0508787890', 'nabil.hossam@email.com', 'Hossam Nabil', '0500909878', 'hossam.nabil@email.com', NOW(), NOW()),
  (28, 1, 'Mona Fadel',     '1995-03-24', 'female', 'Dr. Laila Hassan', 'pending', NULL, '24 Willow St', 'Jeddah', '0559898901', 'mona.fadel@email.com', 'Fadel Mona', '0551010989', 'fadel.mona@email.com', NOW(), NOW()),
  (29, 1, 'Hossam Adel',    '1977-08-06', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '6 Cypress St', 'Mecca', '0531011123', 'hossam.adel@email.com', 'Adel Hossam', '0533232101', 'adel.hossam@email.com', NOW(), NOW()),
  (30, 1, 'Rana Sami',      '1984-11-18', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '18 Magnolia St', 'Dammam', '0542122234', 'rana.sami@email.com', 'Sami Rana', '0544343212', 'sami.rana@email.com', NOW(), NOW()),
  (31, 1, 'Fathi Khaled',   '1993-02-01', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '1 Garden St', 'Riyadh', '0505454567', 'fathi.khaled@email.com', 'Khaled Fathi', '0507676545', 'khaled.fathi@email.com', NOW(), NOW()),
  (32, 1, 'Nisreen Omar',   '1987-05-13', 'female', 'Dr. Laila Hassan', 'pending', NULL, '13 River St', 'Jeddah', '0556565678', 'nisreen.omar@email.com', 'Omar Nisreen', '0558787656', 'omar.nisreen@email.com', NOW(), NOW()),
  (33, 1, 'Tamer Samir',    '1981-08-25', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '25 Lake St', 'Mecca', '0537676789', 'tamer.samir@email.com', 'Samir Tamer', '0539898767', 'samir.tamer@email.com', NOW(), NOW()),
  (34, 1, 'Hana Zaki',      '1996-12-07', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '7 Bay St', 'Dammam', '0548787890', 'hana.zaki@email.com', 'Zaki Hana', '0540909878', 'zaki.hana@email.com', NOW(), NOW()),
  (35, 1, 'Zaki Hassan',    '1980-03-19', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '19 Hill St', 'Riyadh', '0509898901', 'zaki.hassan@email.com', 'Hassan Zaki', '0501010989', 'hassan.zaki@email.com', NOW(), NOW()),
  (36, 1, 'Laila Fathi',    '1992-06-30', 'female', 'Dr. Laila Hassan', 'pending', NULL, '30 Cliff St', 'Jeddah', '0551011123', 'laila.fathi@email.com', 'Fathi Laila', '0553232101', 'fathi.laila@email.com', NOW(), NOW()),
  (37, 1, 'Fadel Nabil',    '1985-09-11', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '11 Field St', 'Mecca', '0532122234', 'fadel.nabil@email.com', 'Nabil Fadel', '0534343212', 'nabil.fadel@email.com', NOW(), NOW()),
  (38, 1, 'Samah Khalil',   '1997-12-23', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '23 Forest St', 'Dammam', '0543233344', 'samah.khalil@email.com', 'Khalil Samah', '0545454323', 'khalil.samah@email.com', NOW(), NOW()),
  (39, 1, 'Kamal Fathi',    '1982-03-05', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '5 Meadow St', 'Riyadh', '0504344455', 'kamal.fathi@email.com', 'Fathi Kamal', '0506565434', 'fathi.kamal@email.com', NOW(), NOW()),
  (40, 1, 'Nadia Adel',     '1994-07-17', 'female', 'Dr. Laila Hassan', 'pending', NULL, '17 Valley St', 'Jeddah', '0555454567', 'nadia.adel@email.com', 'Adel Nadia', '0557676545', 'adel.nadia@email.com', NOW(), NOW()),
  (41, 1, 'Adnan Tarek',    '1986-10-29', 'male', 'Dr. Emad Kamal', 'enabled', NULL, '29 Ridge St', 'Mecca', '0536565678', 'adnan.tarek@email.com', 'Tarek Adnan', '0538787656', 'tarek.adnan@email.com', NOW(), NOW()),
  (42, 1, 'Rasha Sami',     '1991-01-12', 'female', 'Dr. Mona Abdullah', 'disabled', NULL, '12 Grove St', 'Dammam', '0547676789', 'rasha.sami@email.com', 'Sami Rasha', '0549898767', 'sami.rasha@email.com', NOW(), NOW()),
  (43, 1, 'Nasser Hossam',  '1983-04-24', 'male', 'Dr. Sami Youssef', 'blocked', NULL, '24 Park St', 'Riyadh', '0508787890', 'nasser.hossam@email.com', 'Hossam Nasser', '0500909878', 'hossam.nasser@email.com', NOW(), NOW()),
  (44, 1, 'Iman Fadel',     '1995-08-06', 'female', 'Dr. Laila Hassan', 'pending', NULL, '6 Plaza St', 'Jeddah', '0559898901', 'iman.fadel@email.com', 'Fadel Iman', '0551010989', 'fadel.iman@email.com', NOW(), NOW()),
  (45, 1, 'Sara Abdulrahman','1991-10-11', 'female', 'Dr. Mona Abdullah', 'enabled', NULL, '45 Unity St', 'Dammam', '0543456789', 'sara.abdulrahman@email.com', 'Abdulrahman Sara', '0549987654', 'abdulrahman.sara@email.com', NOW(), NOW());

-- Insert patient_measurements (one per patient)
INSERT INTO patient_measurements (patient_id, measured_at, weight_kg, height_cm, temperature_c, blood_pressure_systolic, blood_pressure_diastolic)
VALUES
  (1,  NOW(), 75.2, 175.0, 36.7, 120, 80),
  (2,  NOW(), 62.5, 162.0, 36.5, 110, 70),
  (3,  NOW(), 80.0, 180.0, 36.8, 125, 85),
  (4,  NOW(), 58.0, 160.0, 36.6, 115, 75),
  (5,  NOW(), 70.0, 172.0, 36.7, 118, 78),
  (6,  NOW(), 65.0, 165.0, 36.5, 112, 72),
  (7,  NOW(), 85.0, 182.0, 36.9, 130, 88),
  (8,  NOW(), 60.0, 158.0, 36.4, 108, 68),
  (9,  NOW(), 77.0, 177.0, 36.7, 122, 82),
  (10, NOW(), 63.0, 163.0, 36.5, 111, 71),
  (11, NOW(), 70.0, 170.0, 36.6, 115, 75),
  (12, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (13, NOW(), 75.0, 175.0, 36.7, 120, 80),
  (14, NOW(), 60.0, 160.0, 36.5, 110, 70),
  (15, NOW(), 72.0, 172.0, 36.8, 118, 78),
  (16, NOW(), 63.0, 163.0, 36.6, 108, 68),
  (17, NOW(), 80.0, 180.0, 36.9, 125, 85),
  (18, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (19, NOW(), 70.0, 170.0, 36.6, 115, 75),
  (20, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (21, NOW(), 75.0, 175.0, 36.7, 120, 80),
  (22, NOW(), 60.0, 160.0, 36.5, 110, 70),
  (23, NOW(), 72.0, 172.0, 36.8, 118, 78),
  (24, NOW(), 63.0, 163.0, 36.6, 108, 68),
  (25, NOW(), 80.0, 180.0, 36.9, 125, 85),
  (26, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (27, NOW(), 70.0, 170.0, 36.6, 115, 75),
  (28, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (29, NOW(), 75.0, 175.0, 36.7, 120, 80),
  (30, NOW(), 60.0, 160.0, 36.5, 110, 70),
  (31, NOW(), 72.0, 172.0, 36.8, 118, 78),
  (32, NOW(), 63.0, 163.0, 36.6, 108, 68),
  (33, NOW(), 80.0, 180.0, 36.9, 125, 85),
  (34, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (35, NOW(), 70.0, 170.0, 36.6, 115, 75),
  (36, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (37, NOW(), 75.0, 175.0, 36.7, 120, 80),
  (38, NOW(), 60.0, 160.0, 36.5, 110, 70),
  (39, NOW(), 72.0, 172.0, 36.8, 118, 78),
  (40, NOW(), 63.0, 163.0, 36.6, 108, 68),
  (41, NOW(), 80.0, 180.0, 36.9, 125, 85),
  (42, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (43, NOW(), 70.0, 170.0, 36.6, 115, 75),
  (44, NOW(), 58.0, 158.0, 36.4, 105, 65),
  (45, NOW(), 68.0, 168.0, 36.6, 117, 77);

-- Insert patient_medical (one per patient)
INSERT INTO patient_medical (patient_id, created_at, updated_at)
VALUES
  (1,  NOW(), NOW()),
  (2,  NOW(), NOW()),
  (3,  NOW(), NOW()),
  (4,  NOW(), NOW()),
  (5,  NOW(), NOW()),
  (6,  NOW(), NOW()),
  (7,  NOW(), NOW()),
  (8,  NOW(), NOW()),
  (9,  NOW(), NOW()),
  (10, NOW(), NOW()),
  (11, NOW(), NOW()),
  (12, NOW(), NOW()),
  (13, NOW(), NOW()),
  (14, NOW(), NOW()),
  (15, NOW(), NOW()),
  (16, NOW(), NOW()),
  (17, NOW(), NOW()),
  (18, NOW(), NOW()),
  (19, NOW(), NOW()),
  (20, NOW(), NOW()),
  (21, NOW(), NOW()),
  (22, NOW(), NOW()),
  (23, NOW(), NOW()),
  (24, NOW(), NOW()),
  (25, NOW(), NOW()),
  (26, NOW(), NOW()),
  (27, NOW(), NOW()),
  (28, NOW(), NOW()),
  (29, NOW(), NOW()),
  (30, NOW(), NOW()),
  (31, NOW(), NOW()),
  (32, NOW(), NOW()),
  (33, NOW(), NOW()),
  (34, NOW(), NOW()),
  (35, NOW(), NOW()),
  (36, NOW(), NOW()),
  (37, NOW(), NOW()),
  (38, NOW(), NOW()),
  (39, NOW(), NOW()),
  (40, NOW(), NOW()),
  (41, NOW(), NOW()),
  (42, NOW(), NOW()),
  (43, NOW(), NOW()),
  (44, NOW(), NOW()),
  (45, NOW(), NOW());

-- Insert patient_medical_history (one per patient)
INSERT INTO patient_medical_history (patient_id, history_type, description, date_occurred, created_at)
VALUES
  (1,  'Allergie', 'Souffre d''allergies saisonnières.', '2010-04-15', NOW()),
  (2,  'Chirurgie', 'A subi une appendicectomie.', '2015-06-20', NOW()),
  (3,  'Diabète', 'Diagnostiqué avec le diabète de type 2.', '2018-09-10', NOW()),
  (4,  'Hypertension', 'Souffre d''hypertension artérielle.', '2012-11-05', NOW()),
  (5,  'Asthme', 'Souffre d''asthme depuis l''enfance.', '2000-03-22', NOW()),
  (6,  'Allergie', 'Allergique à la poussière.', '2011-07-18', NOW()),
  (7,  'Chirurgie', 'A subi une chirurgie du genou.', '2016-10-30', NOW()),
  (8,  'Diabète', 'Diagnostiquée avec le diabète.', '2019-01-25', NOW()),
  (9,  'Hypertension', 'Souffre d''hypertension.', '2013-08-14', NOW()),
  (10, 'Asthme', 'Souffre d''asthme.', '2002-05-09', NOW()),
  (11, 'Allergie', 'Allergique au pollen.', '2014-03-12', NOW()),
  (12, 'Chirurgie', 'A subi une opération du dos.', '2017-08-21', NOW()),
  (13, 'Diabète', 'Diabète de type 1.', '2011-12-05', NOW()),
  (14, 'Hypertension', 'Pression artérielle élevée.', '2013-06-17', NOW()),
  (15, 'Asthme', 'Asthme léger.', '2005-09-23', NOW()),
  (16, 'Allergie', 'Allergique aux chats.', '2012-11-30', NOW()),
  (17, 'Chirurgie', 'A subi une chirurgie cardiaque.', '2018-04-19', NOW()),
  (18, 'Diabète', 'Diabète gestationnel.', '2016-07-14', NOW()),
  (19, 'Hypertension', 'Hypertension chronique.', '2010-10-28', NOW()),
  (20, 'Asthme', 'Asthme sévère.', '2003-01-15', NOW()),
  (21, 'Allergie', 'Allergique aux fruits de mer.', '2015-05-11', NOW()),
  (22, 'Chirurgie', 'A subi une chirurgie oculaire.', '2019-09-27', NOW()),
  (23, 'Diabète', 'Diabète contrôlé.', '2012-02-08', NOW()),
  (24, 'Hypertension', 'Hypertension légère.', '2014-12-19', NOW()),
  (25, 'Asthme', 'Asthme d''effort.', '2007-04-03', NOW()),
  (26, 'Allergie', 'Allergique aux noix.', '2013-07-22', NOW()),
  (27, 'Chirurgie', 'A subi une chirurgie dentaire.', '2017-11-16', NOW()),
  (28, 'Diabète', 'Diabète non insulino-dépendant.', '2011-03-29', NOW()),
  (29, 'Hypertension', 'Hypertension modérée.', '2015-08-25', NOW()),
  (30, 'Asthme', 'Asthme allergique.', '2004-02-10', NOW()),
  (31, 'Allergie', 'Allergique au gluten.', '2016-06-06', NOW()),
  (32, 'Chirurgie', 'A subi une chirurgie de la hanche.', '2018-10-13', NOW()),
  (33, 'Diabète', 'Diabète de type 2.', '2013-01-20', NOW()),
  (34, 'Hypertension', 'Hypertension sévère.', '2011-05-28', NOW()),
  (35, 'Asthme', 'Asthme chronique.', '2006-09-14', NOW()),
  (36, 'Allergie', 'Allergique au lait.', '2012-12-02', NOW()),
  (37, 'Chirurgie', 'A subi une chirurgie du poignet.', '2019-03-18', NOW()),
  (38, 'Diabète', 'Diabète insulino-dépendant.', '2014-07-09', NOW()),
  (39, 'Hypertension', 'Hypertension artérielle.', '2010-11-22', NOW()),
  (40, 'Asthme', 'Asthme intermittent.', '2008-03-31', NOW()),
  (41, 'Allergie', 'Allergique aux œufs.', '2013-08-07', NOW()),
  (42, 'Chirurgie', 'A subi une chirurgie du pied.', '2017-12-24', NOW()),
  (43, 'Diabète', 'Diabète mal contrôlé.', '2012-04-16', NOW()),
  (44, 'Hypertension', 'Hypertension familiale.', '2015-09-30', NOW()),
  (45, 'Allergie', 'Allergique aux arachides.', '2017-12-01', NOW());

-- After inserting all patients
SELECT setval('patient_id_seq', (SELECT MAX(id) FROM patient));
COMMIT;

CREATE TABLE IF NOT EXISTS doctor (
    id SERIAL PRIMARY KEY,
    organisation_id INTEGER NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'enabled', -- e.g., enabled, disabled, pending, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample doctors for Organisation 1
INSERT INTO doctor (id, organisation_id, name, specialty, phone_number, email, status, created_at, updated_at) VALUES
  (1, 1, 'Dr. Sami Youssef', 'Cardiology', '+1234567001', 'sami.youssef@drsamia.org', 'enabled', NOW(), NOW()),
  (2, 1, 'Dr. Laila Hassan', 'Pediatrics', '+1234567002', 'laila.hassan@drsamia.org', 'enabled', NOW(), NOW()),
  (3, 1, 'Dr. Emad Kamal', 'General Medicine', '+1234567003', 'emad.kamal@drsamia.org', 'enabled', NOW(), NOW()),
  (4, 1, 'Dr. Mona Abdullah', 'Dermatology', '+1234567004', 'mona.abdullah@drsamia.org', 'enabled', NOW(), NOW());

CREATE TABLE IF NOT EXISTS patient_appointment (
    id SERIAL PRIMARY KEY,
    organisation_id INTEGER NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctor(id), -- optional
    appointment_date TIMESTAMP NOT NULL,
    appointment_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled', -- e.g., scheduled, completed, cancelled, no_show
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_appointment_patient_id ON patient_appointment(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_appointment_doctor_id ON patient_appointment(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_appointment_organisation_id ON patient_appointment(organisation_id);
CREATE INDEX IF NOT EXISTS idx_doctor_organisation_id ON doctor(organisation_id);

-- Insert 6 appointments (3 past, 3 future) for each of the first 5 patients in Organisation 1
INSERT INTO patient_appointment (organisation_id, patient_id, doctor_id, appointment_date, appointment_type, status, notes, created_at, updated_at) VALUES
-- Patient 1
(1, 1, 1, '2024-05-01 09:00:00', 'Consultation', 'completed', 'Routine checkup.', NOW(), NOW()),
(1, 1, 2, '2024-05-15 10:00:00', 'Pediatrics', 'completed', 'Follow-up visit.', NOW(), NOW()),
(1, 1, 3, '2024-05-29 11:00:00', 'General Medicine', 'cancelled', 'Patient cancelled.', NOW(), NOW()),
(1, 1, 4, '2024-06-20 09:00:00', 'Dermatology', 'scheduled', 'Skin check.', NOW(), NOW()),
(1, 1, 1, '2024-07-05 10:00:00', 'Cardiology', 'scheduled', 'Heart review.', NOW(), NOW()),
(1, 1, 2, '2024-07-19 11:00:00', 'Consultation', 'scheduled', 'General consultation.', NOW(), NOW()),

-- Patient 2
(1, 2, 2, '2024-05-02 09:30:00', 'Pediatrics', 'completed', 'Routine pediatric check.', NOW(), NOW()),
(1, 2, 3, '2024-05-16 10:30:00', 'General Medicine', 'completed', 'General health review.', NOW(), NOW()),
(1, 2, 4, '2024-05-30 11:30:00', 'Dermatology', 'cancelled', 'No show.', NOW(), NOW()),
(1, 2, 1, '2024-06-21 09:30:00', 'Cardiology', 'scheduled', 'Cardio follow-up.', NOW(), NOW()),
(1, 2, 2, '2024-07-06 10:30:00', 'Pediatrics', 'scheduled', 'Vaccination.', NOW(), NOW()),
(1, 2, 3, '2024-07-20 11:30:00', 'General Medicine', 'scheduled', 'Annual check.', NOW(), NOW()),

-- Patient 3
(1, 3, 3, '2024-05-03 10:00:00', 'General Medicine', 'completed', 'Blood test.', NOW(), NOW()),
(1, 3, 4, '2024-05-17 11:00:00', 'Dermatology', 'completed', 'Skin allergy.', NOW(), NOW()),
(1, 3, 1, '2024-05-31 12:00:00', 'Cardiology', 'cancelled', 'Rescheduled.', NOW(), NOW()),
(1, 3, 2, '2024-06-22 10:00:00', 'Pediatrics', 'scheduled', 'Growth check.', NOW(), NOW()),
(1, 3, 3, '2024-07-07 11:00:00', 'General Medicine', 'scheduled', 'Lab results.', NOW(), NOW()),
(1, 3, 4, '2024-07-21 12:00:00', 'Dermatology', 'scheduled', 'Skin follow-up.', NOW(), NOW()),

-- Patient 4
(1, 4, 4, '2024-05-04 10:30:00', 'Dermatology', 'completed', 'Mole removal.', NOW(), NOW()),
(1, 4, 1, '2024-05-18 11:30:00', 'Cardiology', 'completed', 'ECG.', NOW(), NOW()),
(1, 4, 2, '2024-06-01 12:30:00', 'Pediatrics', 'cancelled', 'Family emergency.', NOW(), NOW()),
(1, 4, 3, '2024-06-23 10:30:00', 'General Medicine', 'scheduled', 'Blood pressure check.', NOW(), NOW()),
(1, 4, 4, '2024-07-08 11:30:00', 'Dermatology', 'scheduled', 'Acne treatment.', NOW(), NOW()),
(1, 4, 1, '2024-07-22 12:30:00', 'Cardiology', 'scheduled', 'Heart review.', NOW(), NOW()),

-- Patient 5
(1, 5, 1, '2024-05-05 11:00:00', 'Cardiology', 'completed', 'Heart murmur review.', NOW(), NOW()),
(1, 5, 2, '2024-05-19 12:00:00', 'Pediatrics', 'completed', 'Childhood illness.', NOW(), NOW()),
(1, 5, 3, '2024-06-02 13:00:00', 'General Medicine', 'cancelled', 'Patient sick.', NOW(), NOW()),
(1, 5, 4, '2024-06-24 11:00:00', 'Dermatology', 'scheduled', 'Eczema check.', NOW(), NOW()),
(1, 5, 1, '2024-07-09 12:00:00', 'Cardiology', 'scheduled', 'Routine ECG.', NOW(), NOW()),
(1, 5, 2, '2024-07-23 13:00:00', 'Pediatrics', 'scheduled', 'Growth follow-up.', NOW(), NOW());
