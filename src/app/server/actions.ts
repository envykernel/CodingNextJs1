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
import { db as faqData } from '@/fake-db/pages/faq'
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
  const invoices = await prisma.invoice.findMany({
    include: {
      patient: true,
      organisation: true,
      lines: { include: { service: true } },
      payment_applications: true
    },
    orderBy: { id: 'desc' }
  })

  // Map Prisma results to InvoiceType expected by the UI
  return invoices.map(inv => {
    const firstLine = inv.lines[0] || {}
    const totalPaid = inv.payment_applications.reduce((sum, p) => sum + Number(p.amount_applied), 0)
    const balance = Number(inv.total_amount) - totalPaid

    // Debug log for backend calculation
    console.log('[DEBUG] Invoice:', {
      id: inv.id,
      total_amount: inv.total_amount,
      payment_applications: inv.payment_applications,
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
      invoiceStatus: inv.status || 'PENDING',
      invoice_date: inv.invoice_date ? inv.invoice_date.toISOString().split('T')[0] : '',
      invoice_number: inv.invoice_number
    }
  })
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

export const getFaqData = async () => {
  return faqData
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
