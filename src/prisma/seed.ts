import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create the organisation
  const organisation = await prisma.organisation.create({
    data: {
      name: 'Organisation Dr.Samia',
      address: '123 Main St',
      phone_number: '+1234567890',
      email: 'contact@drsamia.org',
      status: 'enabled',
      working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      work_start_time: '08:30',
      work_end_time: '18:00',
      break_start_time: '12:00',
      break_end_time: '13:30'
    }
  })

  // 2. Insert all patients
  const patientsData = [
    {
      name: 'Ahmad Ali',
      birthdate: '1985-03-12',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'enabled',
      address: '12 Victory St',
      city: 'Riyadh',
      phone_number: '0501234567',
      email: 'ahmad.ali1@email.com',
      emergency_contact_name: 'Khaled Ali',
      emergency_contact_phone: '0507654321',
      emergency_contact_email: 'khaled.ali@email.com'
    },
    {
      name: 'Fatima Zahra',
      birthdate: '1990-07-25',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'disabled',
      address: '8 Queen St',
      city: 'Jeddah',
      phone_number: '0552345678',
      email: 'fatima.zahra@email.com',
      emergency_contact_name: 'Sara Zahra',
      emergency_contact_phone: '0558765432',
      emergency_contact_email: 'sara.zahra@email.com'
    },
    {
      name: 'Mohamed Said',
      birthdate: '1978-11-02',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'blocked',
      address: '22 Freedom St',
      city: 'Mecca',
      phone_number: '0533456789',
      email: 'mohamed.said@email.com',
      emergency_contact_name: 'Said Mohamed',
      emergency_contact_phone: '0539876543',
      emergency_contact_email: 'said.mohamed@email.com'
    },
    {
      name: 'Salma Hassan',
      birthdate: '1982-05-18',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'pending',
      address: '5 Flowers St',
      city: 'Dammam',
      phone_number: '0544567890',
      email: 'salma.hassan@email.com',
      emergency_contact_name: 'Hassan Ali',
      emergency_contact_phone: '0540987654',
      emergency_contact_email: 'hassan.ali@email.com'
    },
    {
      name: 'Youssef Ibrahim',
      birthdate: '1995-09-30',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'enabled',
      address: '10 Noor St',
      city: 'Riyadh',
      phone_number: '0505678901',
      email: 'youssef.ibrahim@email.com',
      emergency_contact_name: 'Ibrahim Youssef',
      emergency_contact_phone: '0501987654',
      emergency_contact_email: 'ibrahim.youssef@email.com'
    },
    {
      name: 'Mariam Khaled',
      birthdate: '1988-12-14',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'disabled',
      address: '3 Spring St',
      city: 'Jeddah',
      phone_number: '0556789012',
      email: 'mariam.khaled@email.com',
      emergency_contact_name: 'Khaled Mariam',
      emergency_contact_phone: '0552987654',
      emergency_contact_email: 'khaled.mariam@email.com'
    },
    {
      name: 'Ali Hussein',
      birthdate: '1975-01-22',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'blocked',
      address: '7 Dawn St',
      city: 'Mecca',
      phone_number: '0537890123',
      email: 'ali.hussein@email.com',
      emergency_contact_name: 'Hussein Ali',
      emergency_contact_phone: '0533987654',
      emergency_contact_email: 'hussein.ali@email.com'
    },
    {
      name: 'Huda Abdullah',
      birthdate: '1983-04-09',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'pending',
      address: '15 Hope St',
      city: 'Dammam',
      phone_number: '0548901234',
      email: 'huda.abdullah@email.com',
      emergency_contact_name: 'Abdullah Huda',
      emergency_contact_phone: '0544987654',
      emergency_contact_email: 'abdullah.huda@email.com'
    },
    {
      name: 'Saeed Mahmoud',
      birthdate: '1992-08-27',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'enabled',
      address: '18 Sunrise St',
      city: 'Riyadh',
      phone_number: '0509012345',
      email: 'saeed.mahmoud@email.com',
      emergency_contact_name: 'Mahmoud Saeed',
      emergency_contact_phone: '0505987654',
      emergency_contact_email: 'mahmoud.saeed@email.com'
    },
    {
      name: 'Leila Omar',
      birthdate: '1986-02-16',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'disabled',
      address: '2 Breeze St',
      city: 'Jeddah',
      phone_number: '0550123456',
      email: 'leila.omar@email.com',
      emergency_contact_name: 'Omar Leila',
      emergency_contact_phone: '0556987654',
      emergency_contact_email: 'omar.leila@email.com'
    },
    {
      name: 'Omar Nasser',
      birthdate: '1981-06-10',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '11 Palm St',
      city: 'Riyadh',
      phone_number: '0501122334',
      email: 'omar.nasser@email.com',
      emergency_contact_name: 'Nasser Omar',
      emergency_contact_phone: '0504433221',
      emergency_contact_email: 'nasser.omar@email.com'
    },
    {
      name: 'Amina Fathi',
      birthdate: '1993-09-19',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '19 Lotus St',
      city: 'Jeddah',
      phone_number: '0552233445',
      email: 'amina.fathi@email.com',
      emergency_contact_name: 'Fathi Amina',
      emergency_contact_phone: '0555544332',
      emergency_contact_email: 'fathi.amina@email.com'
    },
    {
      name: 'Hassan Tarek',
      birthdate: '1987-12-23',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '23 Olive St',
      city: 'Mecca',
      phone_number: '0533344556',
      email: 'hassan.tarek@email.com',
      emergency_contact_name: 'Tarek Hassan',
      emergency_contact_phone: '0536655443',
      emergency_contact_email: 'tarek.hassan@email.com'
    },
    {
      name: 'Rania Adel',
      birthdate: '1991-03-05',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '5 Jasmine St',
      city: 'Dammam',
      phone_number: '0544455667',
      email: 'rania.adel@email.com',
      emergency_contact_name: 'Adel Rania',
      emergency_contact_phone: '0547766554',
      emergency_contact_email: 'adel.rania@email.com'
    },
    {
      name: 'Khaled Samir',
      birthdate: '1984-08-29',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '29 Cedar St',
      city: 'Riyadh',
      phone_number: '0505566778',
      email: 'khaled.samir@email.com',
      emergency_contact_name: 'Samir Khaled',
      emergency_contact_phone: '0508877665',
      emergency_contact_email: 'samir.khaled@email.com'
    },
    {
      name: 'Nour Hani',
      birthdate: '1996-11-11',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '11 Sunflower St',
      city: 'Jeddah',
      phone_number: '0556677889',
      email: 'nour.hani@email.com',
      emergency_contact_name: 'Hani Nour',
      emergency_contact_phone: '0559988776',
      emergency_contact_email: 'hani.nour@email.com'
    },
    {
      name: 'Tariq Fadel',
      birthdate: '1979-02-14',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '14 Maple St',
      city: 'Mecca',
      phone_number: '0537788990',
      email: 'tariq.fadel@email.com',
      emergency_contact_name: 'Fadel Tariq',
      emergency_contact_phone: '0530099887',
      emergency_contact_email: 'fadel.tariq@email.com'
    },
    {
      name: 'Dina Samir',
      birthdate: '1985-05-21',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '21 Pine St',
      city: 'Dammam',
      phone_number: '0548899001',
      email: 'dina.samir@email.com',
      emergency_contact_name: 'Samir Dina',
      emergency_contact_phone: '0541100998',
      emergency_contact_email: 'samir.dina@email.com'
    },
    {
      name: 'Majed Adel',
      birthdate: '1994-10-13',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '13 Oak St',
      city: 'Riyadh',
      phone_number: '0509900112',
      email: 'majed.adel@email.com',
      emergency_contact_name: 'Adel Majed',
      emergency_contact_phone: '0502211009',
      emergency_contact_email: 'adel.majed@email.com'
    },
    {
      name: 'Yasmin Fathi',
      birthdate: '1989-01-27',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '27 Rose St',
      city: 'Jeddah',
      phone_number: '0551011122',
      email: 'yasmin.fathi@email.com',
      emergency_contact_name: 'Fathi Yasmin',
      emergency_contact_phone: '0553322110',
      emergency_contact_email: 'fathi.yasmin@email.com'
    },
    {
      name: 'Samir Nabil',
      birthdate: '1982-04-15',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '15 Tulip St',
      city: 'Mecca',
      phone_number: '0532122233',
      email: 'samir.nabil@email.com',
      emergency_contact_name: 'Nabil Samir',
      emergency_contact_phone: '0534343212',
      emergency_contact_email: 'nabil.samir@email.com'
    },
    {
      name: 'Hiba Khalil',
      birthdate: '1997-07-08',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '8 Daisy St',
      city: 'Dammam',
      phone_number: '0543233344',
      email: 'hiba.khalil@email.com',
      emergency_contact_name: 'Khalil Hiba',
      emergency_contact_phone: '0545454323',
      emergency_contact_email: 'khalil.hiba@email.com'
    },
    {
      name: 'Fadi Zaki',
      birthdate: '1980-10-19',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '19 Lily St',
      city: 'Riyadh',
      phone_number: '0504344455',
      email: 'fadi.zaki@email.com',
      emergency_contact_name: 'Zaki Fadi',
      emergency_contact_phone: '0506565434',
      emergency_contact_email: 'zaki.fadi@email.com'
    },
    {
      name: 'Lina Nasser',
      birthdate: '1992-02-03',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '3 Orchid St',
      city: 'Jeddah',
      phone_number: '0555454567',
      email: 'lina.nasser@email.com',
      emergency_contact_name: 'Nasser Lina',
      emergency_contact_phone: '0557676545',
      emergency_contact_email: 'nasser.lina@email.com'
    },
    {
      name: 'Adel Fathi',
      birthdate: '1986-06-17',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '17 Ivy St',
      city: 'Mecca',
      phone_number: '0536565678',
      email: 'adel.fathi@email.com',
      emergency_contact_name: 'Fathi Adel',
      emergency_contact_phone: '0538787656',
      emergency_contact_email: 'fathi.adel@email.com'
    },
    {
      name: 'Sara Tarek',
      birthdate: '1991-09-29',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '29 Fern St',
      city: 'Dammam',
      phone_number: '0547676789',
      email: 'sara.tarek@email.com',
      emergency_contact_name: 'Tarek Sara',
      emergency_contact_phone: '0549898767',
      emergency_contact_email: 'tarek.sara@email.com'
    },
    {
      name: 'Nabil Hossam',
      birthdate: '1983-12-12',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '12 Elm St',
      city: 'Riyadh',
      phone_number: '0508787890',
      email: 'nabil.hossam@email.com',
      emergency_contact_name: 'Hossam Nabil',
      emergency_contact_phone: '0500909878',
      emergency_contact_email: 'hossam.nabil@email.com'
    },
    {
      name: 'Mona Fadel',
      birthdate: '1995-03-24',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '24 Willow St',
      city: 'Jeddah',
      phone_number: '0559898901',
      email: 'mona.fadel@email.com',
      emergency_contact_name: 'Fadel Mona',
      emergency_contact_phone: '0551010989',
      emergency_contact_email: 'fadel.mona@email.com'
    },
    {
      name: 'Hossam Adel',
      birthdate: '1977-08-06',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '6 Cypress St',
      city: 'Mecca',
      phone_number: '0531011123',
      email: 'hossam.adel@email.com',
      emergency_contact_name: 'Adel Hossam',
      emergency_contact_phone: '0533232101',
      emergency_contact_email: 'adel.hossam@email.com'
    },
    {
      name: 'Rana Sami',
      birthdate: '1984-11-18',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '18 Magnolia St',
      city: 'Dammam',
      phone_number: '0542122234',
      email: 'rana.sami@email.com',
      emergency_contact_name: 'Sami Rana',
      emergency_contact_phone: '0544343212',
      emergency_contact_email: 'sami.rana@email.com'
    },
    {
      name: 'Fathi Khaled',
      birthdate: '1993-02-01',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '1 Garden St',
      city: 'Riyadh',
      phone_number: '0505454567',
      email: 'fathi.khaled@email.com',
      emergency_contact_name: 'Khaled Fathi',
      emergency_contact_phone: '0507676545',
      emergency_contact_email: 'khaled.fathi@email.com'
    },
    {
      name: 'Nisreen Omar',
      birthdate: '1987-05-13',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '13 River St',
      city: 'Jeddah',
      phone_number: '0556565678',
      email: 'nisreen.omar@email.com',
      emergency_contact_name: 'Omar Nisreen',
      emergency_contact_phone: '0558787656',
      emergency_contact_email: 'omar.nisreen@email.com'
    },
    {
      name: 'Tamer Samir',
      birthdate: '1981-08-25',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '25 Lake St',
      city: 'Mecca',
      phone_number: '0537676789',
      email: 'tamer.samir@email.com',
      emergency_contact_name: 'Samir Tamer',
      emergency_contact_phone: '0539898767',
      emergency_contact_email: 'samir.tamer@email.com'
    },
    {
      name: 'Hana Zaki',
      birthdate: '1996-12-07',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '7 Bay St',
      city: 'Dammam',
      phone_number: '0548787890',
      email: 'hana.zaki@email.com',
      emergency_contact_name: 'Zaki Hana',
      emergency_contact_phone: '0540909878',
      emergency_contact_email: 'zaki.hana@email.com'
    },
    {
      name: 'Zaki Hassan',
      birthdate: '1980-03-19',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '19 Hill St',
      city: 'Riyadh',
      phone_number: '0509898901',
      email: 'zaki.hassan@email.com',
      emergency_contact_name: 'Hassan Zaki',
      emergency_contact_phone: '0501010989',
      emergency_contact_email: 'hassan.zaki@email.com'
    },
    {
      name: 'Laila Fathi',
      birthdate: '1992-06-30',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '30 Cliff St',
      city: 'Jeddah',
      phone_number: '0551011123',
      email: 'laila.fathi@email.com',
      emergency_contact_name: 'Fathi Laila',
      emergency_contact_phone: '0553232101',
      emergency_contact_email: 'fathi.laila@email.com'
    },
    {
      name: 'Fadel Nabil',
      birthdate: '1985-09-11',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '11 Field St',
      city: 'Mecca',
      phone_number: '0532122234',
      email: 'fadel.nabil@email.com',
      emergency_contact_name: 'Nabil Fadel',
      emergency_contact_phone: '0534343212',
      emergency_contact_email: 'nabil.fadel@email.com'
    },
    {
      name: 'Samah Khalil',
      birthdate: '1997-12-23',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '23 Forest St',
      city: 'Dammam',
      phone_number: '0543233344',
      email: 'samah.khalil@email.com',
      emergency_contact_name: 'Khalil Samah',
      emergency_contact_phone: '0545454323',
      emergency_contact_email: 'khalil.samah@email.com'
    },
    {
      name: 'Kamal Fathi',
      birthdate: '1982-03-05',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '5 Meadow St',
      city: 'Riyadh',
      phone_number: '0504344455',
      email: 'kamal.fathi@email.com',
      emergency_contact_name: 'Fathi Kamal',
      emergency_contact_phone: '0506565434',
      emergency_contact_email: 'fathi.kamal@email.com'
    },
    {
      name: 'Nadia Adel',
      birthdate: '1994-07-17',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '17 Valley St',
      city: 'Jeddah',
      phone_number: '0555454567',
      email: 'nadia.adel@email.com',
      emergency_contact_name: 'Adel Nadia',
      emergency_contact_phone: '0557676545',
      emergency_contact_email: 'adel.nadia@email.com'
    },
    {
      name: 'Adnan Tarek',
      birthdate: '1986-10-29',
      gender: 'male',
      doctor: 'Dr. Emad Kamal',
      status: 'enabled',
      address: '29 Ridge St',
      city: 'Mecca',
      phone_number: '0536565678',
      email: 'adnan.tarek@email.com',
      emergency_contact_name: 'Tarek Adnan',
      emergency_contact_phone: '0538787656',
      emergency_contact_email: 'tarek.adnan@email.com'
    },
    {
      name: 'Rasha Sami',
      birthdate: '1991-01-12',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'disabled',
      address: '12 Grove St',
      city: 'Dammam',
      phone_number: '0547676789',
      email: 'rasha.sami@email.com',
      emergency_contact_name: 'Sami Rasha',
      emergency_contact_phone: '0549898767',
      emergency_contact_email: 'sami.rasha@email.com'
    },
    {
      name: 'Nasser Hossam',
      birthdate: '1983-04-24',
      gender: 'male',
      doctor: 'Dr. Sami Youssef',
      status: 'blocked',
      address: '24 Park St',
      city: 'Riyadh',
      phone_number: '0508787890',
      email: 'nasser.hossam@email.com',
      emergency_contact_name: 'Hossam Nasser',
      emergency_contact_phone: '0500909878',
      emergency_contact_email: 'hossam.nasser@email.com'
    },
    {
      name: 'Iman Fadel',
      birthdate: '1995-08-06',
      gender: 'female',
      doctor: 'Dr. Laila Hassan',
      status: 'pending',
      address: '6 Plaza St',
      city: 'Jeddah',
      phone_number: '0559898901',
      email: 'iman.fadel@email.com',
      emergency_contact_name: 'Fadel Iman',
      emergency_contact_phone: '0551010989',
      emergency_contact_email: 'fadel.iman@email.com'
    },
    {
      name: 'Sara Abdulrahman',
      birthdate: '1991-10-11',
      gender: 'female',
      doctor: 'Dr. Mona Abdullah',
      status: 'enabled',
      address: '45 Unity St',
      city: 'Dammam',
      phone_number: '0543456789',
      email: 'sara.abdulrahman@email.com',
      emergency_contact_name: 'Abdulrahman Sara',
      emergency_contact_phone: '0549987654',
      emergency_contact_email: 'abdulrahman.sara@email.com'
    }
  ]

  // Insert all patients and keep their IDs
  const patients = []

  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        organisation_id: organisation.id,
        name: p.name,
        birthdate: new Date(p.birthdate),
        gender: p.gender,
        doctor: p.doctor,
        status: p.status,
        address: p.address,
        city: p.city,
        phone_number: p.phone_number,
        email: p.email,
        emergency_contact_name: p.emergency_contact_name,
        emergency_contact_phone: p.emergency_contact_phone,
        emergency_contact_email: p.emergency_contact_email
      }
    })

    patients.push(patient)
  }

  // 2b. Insert doctors
  const doctorsData = [
    {
      name: 'Dr. Sami Youssef',
      specialty: 'General Medicine',
      phone_number: '+1111111111',
      email: 'sami.youssef@drsamia.org',
      status: 'enabled'
    },
    {
      name: 'Dr. Laila Hassan',
      specialty: 'Pediatrics',
      phone_number: '+2222222222',
      email: 'laila.hassan@drsamia.org',
      status: 'enabled'
    },
    {
      name: 'Dr. Emad Kamal',
      specialty: 'Cardiology',
      phone_number: '+3333333333',
      email: 'emad.kamal@drsamia.org',
      status: 'enabled'
    },
    {
      name: 'Dr. Mona Abdullah',
      specialty: 'Dermatology',
      phone_number: '+4444444444',
      email: 'mona.abdullah@drsamia.org',
      status: 'enabled'
    }
  ]

  const doctors = []

  for (const d of doctorsData) {
    const doctor = await prisma.doctor.create({
      data: {
        organisation_id: organisation.id,
        name: d.name,
        specialty: d.specialty,
        phone_number: d.phone_number,
        email: d.email,
        status: d.status,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    doctors.push(doctor)
  }

  // 2c. Insert patient_appointments (one per patient, assign doctor by name if possible)
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i]

    // Find doctor by name
    const doctor = doctors.find(d => d.name === patient.doctor) || doctors[0]

    await prisma.patient_appointment.create({
      data: {
        organisation_id: organisation.id,
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: new Date(2024, 4, (i % 28) + 1, 10 + (i % 6), 0, 0), // Spread over May 2024, 10:00-15:00
        appointment_type: 'Consultation',
        status: 'scheduled',
        notes: 'Initial appointment',
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  }

  // 3. Insert patient_measurements (one per patient, example values)
  for (const patient of patients) {
    await prisma.patient_measurements.create({
      data: {
        patient_id: patient.id,
        organisation_id: organisation.id,
        measured_at: new Date(),
        weight_kg: 70 + Math.floor(Math.random() * 20),
        height_cm: 160 + Math.floor(Math.random() * 20),
        temperature_c: 36.5 + Math.random(),
        blood_pressure_systolic: 110 + Math.floor(Math.random() * 20),
        blood_pressure_diastolic: 70 + Math.floor(Math.random() * 10)
      }
    })
  }

  // 4. Insert patient_medical (one per patient)
  for (const patient of patients) {
    await prisma.patient_medical.create({
      data: {
        patient_id: patient.id,
        organisation_id: organisation.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  }

  // 5. Insert patient_medical_history (one per patient, example values)
  for (const patient of patients) {
    await prisma.patient_medical_history.create({
      data: {
        patient_id: patient.id,
        organisation_id: organisation.id,
        history_type: 'General',
        description: 'No significant history',
        date_occurred: new Date('2020-01-01'),
        created_at: new Date()
      }
    })
  }

  console.log('Seed completed: 1 organisation, 45 patients, measurements, medical, and history records.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
