'use server'

import { InvoicePaymentStatus, InvoiceRecordStatus, type invoice as InvoicePrismaType } from '@prisma/client'

import { prisma } from '@/libs/prisma'

// Define a type for the converted invoice data
export type ConvertedInvoice = {
  id: number
  organisation_id: number
  patient_id: number | null
  visit_id: number | null
  invoice_number: string
  invoice_date: Date
  due_date: Date | null
  payment_status: string
  record_status: string
  total_amount: number
  notes: string | null
  created_at: Date
  updated_at: Date | null
  archived_at: Date | null
  deleted_at: Date | null
  archived_by: number | null
  deleted_by: number | null
  patient: {
    name: string | null
  } | null
  organisation: {
    name: string
    address: string
    city: string
    phone_number: string
    email: string
    has_pre_printed_header: boolean
    has_pre_printed_footer: boolean
    header_height: number | null
    footer_height: number | null
  }
  lines: Array<{
    id: number
    organisation_id: number
    created_at: Date
    invoice_id: number
    service_id: number
    service_name: string
    service_code: string
    service_description: string | null
    description: string | null
    quantity: number
    unit_price: number
    line_total: number
    service: {
      id: number
      name: string
      amount: number
    }
  }>
  payment_apps: Array<{
    id: number
    organisation_id: number
    created_at: Date
    invoice_id: number
    payment_id: number
    applied_date: Date
    payment: {
      id: number
      amount: number
    }
  }>
}

export async function getInvoice(id: number): Promise<ConvertedInvoice> {
  try {
    const invoice = (await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            name: true
          }
        },
        organisation: true,
        lines: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        payment_apps: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true
              }
            }
          }
        }
      }
    })) as (InvoicePrismaType & { lines: any[]; payment_apps: any[] }) | null

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Convert all Decimal values to numbers
    const convertedInvoice = {
      ...invoice,
      total_amount: Number(invoice.total_amount),
      lines: invoice.lines.map((line: any) => ({
        ...line,
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
        service: {
          ...line.service,
          amount: Number(line.service.amount)
        }
      })),
      payment_apps: invoice.payment_apps.map((app: any) => ({
        ...app,
        payment: {
          ...app.payment,
          amount: Number(app.payment.amount)
        }
      }))
    }

    return convertedInvoice as unknown as ConvertedInvoice
  } catch (error) {
    console.error('Error in getInvoice:', error)
    throw new Error('Failed to fetch invoice')
  }
}

// Additional utility functions for invoices

export async function getInvoicesByPatient(patientId: number, orderBy?: any, organisationId?: number) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        patient_id: patientId,
        ...(organisationId && { organisation_id: organisationId })
      },
      include: {
        organisation: {
          select: {
            id: true,
            name: true
          }
        },
        lines: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        payment_apps: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true
              }
            }
          }
        }
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    // Convert Decimal values to numbers
    return invoices.map(invoice => ({
      ...invoice,
      total_amount: Number(invoice.total_amount),
      lines: (invoice.lines as any[]).map((line: any) => ({
        ...line,
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
        service: {
          ...line.service,
          amount: Number(line.service.amount)
        }
      })),
      payment_apps: (invoice.payment_apps as any[]).map((app: any) => ({
        ...app,
        payment: {
          ...app.payment,
          amount: Number(app.payment.amount)
        }
      }))
    }))
  } catch (error) {
    console.error('Error in getInvoicesByPatient:', error)
    throw new Error('Failed to fetch invoices')
  }
}

export async function getInvoicesByOrganisation(organisationId: number, orderBy?: any) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        organisation_id: organisationId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        lines: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        payment_apps: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true
              }
            }
          }
        }
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    // Convert Decimal values to numbers
    return invoices.map(invoice => ({
      ...invoice,
      total_amount: Number(invoice.total_amount),
      lines: invoice.lines.map(line => ({
        ...line,
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
        service: {
          ...line.service,
          amount: Number(line.service.amount)
        }
      })),
      payment_apps: invoice.payment_apps.map(app => ({
        ...app,
        payment: {
          ...app.payment,
          amount: Number(app.payment.amount)
        }
      }))
    }))
  } catch (error) {
    console.error('Error in getInvoicesByOrganisation:', error)
    throw new Error('Failed to fetch invoices')
  }
}

export async function getInvoicesByVisit(visitId: number, orderBy?: any) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        visit_id: visitId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        organisation: {
          select: {
            id: true,
            name: true
          }
        },
        lines: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        payment_apps: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true
              }
            }
          }
        }
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    // Convert Decimal values to numbers
    return invoices.map(invoice => ({
      ...invoice,
      total_amount: Number(invoice.total_amount),
      lines: invoice.lines.map(line => ({
        ...line,
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
        service: {
          ...line.service,
          amount: Number(line.service.amount)
        }
      })),
      payment_apps: invoice.payment_apps.map(app => ({
        ...app,
        payment: {
          ...app.payment,
          amount: Number(app.payment.amount)
        }
      }))
    }))
  } catch (error) {
    console.error('Error in getInvoicesByVisit:', error)
    throw new Error('Failed to fetch invoices')
  }
}

export async function getInvoicesByPaymentStatus(status: string, organisationId?: number, orderBy?: any) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        payment_status: status as InvoicePaymentStatus,
        ...(organisationId && { organisation_id: organisationId })
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        organisation: {
          select: {
            id: true,
            name: true
          }
        },
        lines: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        payment_apps: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true
              }
            }
          }
        }
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    // Convert Decimal values to numbers
    return invoices.map(invoice => ({
      ...invoice,
      total_amount: Number(invoice.total_amount),
      lines: (invoice.lines as any[]).map((line: any) => ({
        ...line,
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
        service: {
          ...line.service,
          amount: Number(line.service.amount)
        }
      })),
      payment_apps: (invoice.payment_apps as any[]).map((app: any) => ({
        ...app,
        payment: {
          ...app.payment,
          amount: Number(app.payment.amount)
        }
      }))
    }))
  } catch (error) {
    console.error('Error in getInvoicesByPaymentStatus:', error)
    throw new Error('Failed to fetch invoices')
  }
}

export async function createInvoice(data: any) {
  try {
    const { organisation_id, patient_id, visit_id, invoice_number, invoice_date, due_date, notes, lines } = data

    // Calculate total amount from lines
    const total_amount = lines.reduce((sum: number, line: any) => {
      return sum + line.quantity * line.unit_price
    }, 0)

    const invoice = await prisma.invoice.create({
      data: {
        organisation_id,
        patient_id,
        visit_id,
        invoice_number,
        invoice_date,
        due_date,
        payment_status: InvoicePaymentStatus.PENDING,
        record_status: InvoiceRecordStatus.ACTIVE,
        total_amount,
        notes,
        lines: {
          create: lines.map((line: any) => ({
            organisation_id,
            service_id: line.service_id,
            service_name: line.service_name,
            service_code: line.service_code,
            service_description: line.service_description,
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            line_total: line.quantity * line.unit_price
          }))
        }
      },
      include: {
        patient: {
          select: {
            name: true
          }
        },
        organisation: true,
        lines: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        payment_apps: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true
              }
            }
          }
        }
      }
    })

    // Convert Decimal values to numbers
    const convertedInvoice = {
      ...invoice,
      total_amount: Number(invoice.total_amount),
      lines: (invoice.lines as any[]).map((line: any) => ({
        ...line,
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
        service: {
          ...line.service,
          amount: Number(line.service.amount)
        }
      })),
      payment_apps: (invoice.payment_apps as any[]).map((app: any) => ({
        ...app,
        payment: {
          ...app.payment,
          amount: Number(app.payment.amount)
        }
      }))
    }

    return convertedInvoice
  } catch (error) {
    console.error('Error in createInvoice:', error)
    throw new Error('Failed to create invoice')
  }
}

export async function updateInvoice(id: number, data: any) {
  try {
    const { notes, lines, payment_status, due_date } = data

    // Calculate total amount from lines if provided
    let total_amount = undefined

    if (lines) {
      total_amount = lines.reduce((sum: number, line: any) => {
        return sum + line.quantity * line.unit_price
      }, 0)
    }

    // Delete existing lines if new lines are provided
    if (lines) {
      await prisma.invoice_line.deleteMany({
        where: { invoice_id: id }
      })
    }

    const invoice = (await prisma.invoice.update({
      where: { id },
      data: {
        ...(notes && { notes }),
        ...(payment_status && { payment_status: payment_status as InvoicePaymentStatus }),
        ...(due_date && { due_date }),
        ...(total_amount !== undefined && { total_amount }),
        ...(lines && {
          lines: {
            create: lines.map((line: any) => ({
              organisation_id: data.organisation_id,
              service_id: line.service_id,
              service_name: line.service_name,
              service_code: line.service_code,
              service_description: line.service_description,
              description: line.description,
              quantity: line.quantity,
              unit_price: line.unit_price,
              line_total: line.quantity * line.unit_price
            }))
          }
        })
      },
      include: {
        patient: {
          select: {
            name: true
          }
        },
        organisation: true,
        lines: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        payment_apps: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true
              }
            }
          }
        }
      }
    })) as InvoicePrismaType & { lines: any[]; payment_apps: any[] }

    // Convert Decimal values to numbers
    const convertedInvoice = {
      ...invoice,
      total_amount: Number(invoice.total_amount),
      lines: (invoice.lines as any[]).map((line: any) => ({
        ...line,
        unit_price: Number(line.unit_price),
        line_total: Number(line.line_total),
        service: {
          ...line.service,
          amount: Number(line.service.amount)
        }
      })),
      payment_apps: (invoice.payment_apps as any[]).map((app: any) => ({
        ...app,
        payment: {
          ...app.payment,
          amount: Number(app.payment.amount)
        }
      }))
    }

    return convertedInvoice
  } catch (error) {
    console.error('Error in updateInvoice:', error)
    throw new Error('Failed to update invoice')
  }
}

export async function deleteInvoice(id: number) {
  try {
    // Delete invoice lines first (due to foreign key constraint)
    await prisma.invoice_line.deleteMany({
      where: { invoice_id: id }
    })

    // Delete payment applications
    await prisma.payment_application.deleteMany({
      where: { invoice_id: id }
    })

    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error('Error in deleteInvoice:', error)
    throw new Error('Failed to delete invoice')
  }
}
