/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */

'use server'

// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce'
import { db as academyData } from '@/fake-db/apps/academy'
import { db as vehicleData } from '@/fake-db/apps/logistics'
import { db as userData } from '@/fake-db/apps/userList'
import { db as permissionData } from '@/fake-db/apps/permissions'
import { db as profileData } from '@/fake-db/pages/userProfile'
import { db as pricingData } from '@/fake-db/pages/pricing'
import { db as statisticsData } from '@/fake-db/pages/widgetExamples'
import { prisma } from '@/prisma/prisma'

export const getEcommerceData = async () => {
  return eCommerceData
}

export const getAcademyData = async () => {
  return academyData
}

export const getLogisticsData = async () => {
  return vehicleData
}

export const getInvoiceData = async () => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: true,
        organisation: true,
        lines: { include: { service: true } },
        payment_apps: true
      },
      orderBy: { id: 'desc' }
    })

    // Map Prisma results to InvoiceType expected by the UI
    return invoices.map(inv => {
      const firstLine = inv.lines[0] || {}
      const totalPaid = inv.payment_apps.reduce((sum, p) => sum + Number(p.amount_applied), 0)
      const balance = Number(inv.total_amount) - totalPaid

      // Debug log for backend calculation
      console.log('[DEBUG] Invoice:', {
        id: inv.id,
        total_amount: inv.total_amount,
        payment_apps: inv.payment_apps,
        totalPaid,
        balance
      })

      return {
        id: inv.id.toString(),
        name: inv.patient?.name || '',
        total: Number(inv.total_amount),
        avatar: inv.patient?.avatar || '',
        service: firstLine.service?.name || '',
        dueDate: inv.due_date ? inv.due_date.toISOString().split('T')[0] : '',
        address: inv.patient?.address || '',
        company: inv.organisation?.name || '',
        country: inv.organisation?.address || '', // Placeholder, no country field
        contact: inv.patient?.phone_number || '',
        avatarColor: 'primary', // Or any logic you want
        companyEmail: inv.patient?.email || '',
        balance: (balance ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'EUR' }),
        payment_status: inv.payment_status,
        record_status: inv.record_status,
        archived_at: inv.archived_at ? inv.archived_at.toISOString() : undefined,
        deleted_at: inv.deleted_at ? inv.deleted_at.toISOString() : undefined,
        invoice_date: inv.invoice_date ? inv.invoice_date.toISOString().split('T')[0] : '',
        invoice_number: inv.invoice_number
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)

    // Return empty array instead of throwing error
    return []
  }
}

export const getUserData = async () => {
  return userData
}

export const getPermissionsData = async () => {
  return permissionData
}

export const getProfileData = async () => {
  return profileData
}

// Type for FAQ from database
type FAQFromDB = {
  id: number
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
  created_at: Date
  updated_at: Date
}

export const getFaqData = async () => {
  // Fetch FAQs from database and group by category
  const faqs = (await prisma.fAQ.findMany({
    where: {
      isActive: true
    },
    orderBy: [{ category: 'asc' }, { order: 'asc' }]
  })) as FAQFromDB[]

  // Transform the data into the expected format
  const categories = Array.from(new Set(faqs.map(faq => faq.category))) as string[]

  return categories.map(category => {
    const categoryFaqs = faqs.filter(faq => faq.category === category)

    return {
      id: category.toLowerCase().replace(/\s+/g, '-'),
      title: category,
      icon: getCategoryIcon(category),
      subtitle: `Get help with ${category.toLowerCase()}`,
      questionsAnswers: categoryFaqs.map(faq => ({
        id: `faq-${faq.id}`,
        question: faq.question,
        answer: faq.answer
      }))
    }
  })
}

// Helper function to get icon based on category
const getCategoryIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    Patients: 'tabler-users',
    Appointments: 'tabler-calendar',
    Billing: 'tabler-credit-card',
    'User Management': 'tabler-user',
    System: 'tabler-settings',
    General: 'tabler-help'
  }

  return iconMap[category] || 'tabler-help'
}

export const getPricingData = async () => {
  return pricingData
}

export const getStatisticsData = async () => {
  return statisticsData
}

export const getPatientData = async () => {
  // Mocked patient data
  return [
    {
      id: 1,
      name: 'John Doe',
      medicalRecordNumber: 'MRN123456',
      age: 45,
      gender: 'Male',
      diagnosis: 'Hypertension',
      doctor: 'Dr. Smith',
      admissionDate: '2024-06-01',
      status: 'admitted',
      avatar: ''
    },
    {
      id: 2,
      name: 'Jane Smith',
      medicalRecordNumber: 'MRN654321',
      age: 60,
      gender: 'Female',
      diagnosis: 'Diabetes',
      doctor: 'Dr. Brown',
      admissionDate: '2024-05-28',
      status: 'underObservation',
      avatar: ''
    }
  ]
}

export async function updatePatientAction(patientId: number, data: any) {
  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        name: data.name,
        birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
        gender: data.gender,
        doctor: data.doctor,
        status: data.status,
        avatar: data.avatar,
        address: data.address,
        city: data.city,
        phone_number: data.phone_number,
        email: data.email,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_email: data.emergency_contact_email,
        updated_at: new Date()
      }
    })

    // Fetch the updated patient with related data
    const patientWithRelations = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        patient_measurements: true,
        patient_medical: true,
        patient_medical_history: true,
        doctor: true
      }
    })

    if (!patientWithRelations) {
      throw new Error('Patient not found after update')
    }

    // Map null string fields to undefined and handle decimal types
    return {
      ...patientWithRelations,
      doctor: patientWithRelations.doctor ?? undefined,
      status: patientWithRelations.status ?? undefined,
      avatar: patientWithRelations.avatar ?? undefined,
      address: patientWithRelations.address ?? undefined,
      city: patientWithRelations.city ?? undefined,
      phone_number: patientWithRelations.phone_number ?? undefined,
      email: patientWithRelations.email ?? undefined,
      birthdate: patientWithRelations.birthdate ?? undefined,
      emergency_contact_name: patientWithRelations.emergency_contact_name ?? undefined,
      emergency_contact_phone: patientWithRelations.emergency_contact_phone ?? undefined,
      emergency_contact_email: patientWithRelations.emergency_contact_email ?? undefined,
      created_at: patientWithRelations.created_at ?? undefined,
      updated_at: patientWithRelations.updated_at ?? undefined,
      patient_measurements: patientWithRelations.patient_measurements.map(m => ({
        ...m,
        weight_kg: typeof m.weight_kg === 'object' && m.weight_kg !== null ? Number(m.weight_kg) : m.weight_kg,
        height_cm: typeof m.height_cm === 'object' && m.height_cm !== null ? Number(m.height_cm) : m.height_cm,
        temperature_c:
          typeof m.temperature_c === 'object' && m.temperature_c !== null ? Number(m.temperature_c) : m.temperature_c
      }))
    }
  } catch (error) {
    console.error('Error updating patient:', error)
    throw error
  }
}
