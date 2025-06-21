'use server'

import { prisma } from '@/libs/prisma'
import { formatDateToDDMMYYYY } from '@/utils/date'

interface RadiologyOrderItem {
  id: number
  patient_id: number
  visit_id: number | null
  doctor_id: number | null
  exam_type_id: number
  organisation_id: number
  ordered_at: string | null
  status: string | null
  result: string | null
  result_date: string | null
  notes: string | null
  exam_type: {
    id: number
    name: string
    category: string | null
  }
}

interface RadiologyOrderWithGrouping {
  id: number
  patient_id: number
  visit_id: number | null
  doctor_id: number | null
  exam_type_id: number
  organisation_id: number
  ordered_at: string | null
  status: string | null
  result: string | null
  result_date: string | null
  notes: string | null
  patient: {
    id: number
    name: string
    birthdate: Date
    gender: string
  }
  doctor: {
    id: number
    name: string
  } | null
  organisation: {
    id: number
    name: string
    address: string | null
    city: string | null
    phone_number: string | null
    email: string | null
    has_pre_printed_header: boolean
    has_pre_printed_footer: boolean
    header_height: number | null
    footer_height: number | null
  }
  visit: {
    id: number
  } | null
  exam_type: {
    id: number
    name: string
  }
  items: RadiologyOrderItem[]
  groupedItems: Record<string, RadiologyOrderItem[]>
}

export type { RadiologyOrderItem, RadiologyOrderWithGrouping }

export async function getRadiologyOrder(id: string): Promise<RadiologyOrderWithGrouping> {
  try {
    // First get the current radiology order to get the visit_id
    const currentRadiologyOrder = await prisma.radiology_order.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        doctor: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true,
            has_pre_printed_header: true,
            has_pre_printed_footer: true,
            header_height: true,
            footer_height: true
          }
        },
        visit: true,
        exam_type: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    if (!currentRadiologyOrder) {
      throw new Error('Radiology order not found')
    }

    // If there's a visit_id, get all radiology orders for this visit
    if (currentRadiologyOrder.visit_id) {
      const allRadiologyOrders = await prisma.radiology_order.findMany({
        where: {
          visit_id: currentRadiologyOrder.visit_id,
          patient_id: currentRadiologyOrder.patient_id
        },
        include: {
          exam_type: {
            select: {
              id: true,
              name: true,
              category: true
            }
          }
        },
        orderBy: [{ exam_type: { category: 'asc' } }, { ordered_at: 'asc' }]
      })

      // Group the orders by category
      const groupedOrders = allRadiologyOrders.reduce(
        (acc, order) => {
          const category = order.exam_type.category || 'Non catégorisé'

          if (!acc[category]) {
            acc[category] = []
          }

          acc[category].push(order as RadiologyOrderItem)

          return acc
        },
        {} as Record<string, RadiologyOrderItem[]>
      )

      // Return the current order with grouped orders
      return {
        ...currentRadiologyOrder,
        items: allRadiologyOrders as RadiologyOrderItem[],
        groupedItems: groupedOrders
      }
    }

    // If no visit_id, just return the single order
    const category = currentRadiologyOrder.exam_type.category || 'Non catégorisé'

    return {
      ...currentRadiologyOrder,
      items: [currentRadiologyOrder as RadiologyOrderItem],
      groupedItems: {
        [category]: [currentRadiologyOrder as RadiologyOrderItem]
      }
    }
  } catch (error) {
    console.error('Error in getRadiologyOrder:', error)
    throw new Error('Failed to fetch radiology order')
  }
}

export async function getRadiologyExamTypes() {
  try {
    const examTypes = await prisma.radiology_exam_type.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return examTypes
  } catch (error) {
    console.error('Error in getRadiologyExamTypes:', error)
    throw new Error('Failed to fetch radiology exam types')
  }
}

export async function getRadiologyOrdersByVisit(visitId: number, orderBy?: any) {
  try {
    const orders = await prisma.radiology_order.findMany({
      where: {
        visit_id: visitId
      },
      include: {
        exam_type: true
      },
      orderBy: orderBy || {
        ordered_at: 'desc'
      }
    })

    return orders
  } catch (error) {
    console.error('Error in getRadiologyOrdersByVisit:', error)
    throw new Error('Failed to fetch radiology orders')
  }
}

export async function createRadiologyOrders(visit_id: number, orders: any[], includeVisitData: boolean = true) {
  try {
    const visit = await prisma.patient_visit.findUnique({
      where: { id: visit_id },
      select: {
        organisation_id: true,
        patient_id: true,
        doctor_id: true
      }
    })

    if (!visit) {
      throw new Error('Visit not found')
    }

    // Create all orders in a transaction
    const createdOrders = await prisma.$transaction(
      orders.map(order =>
        prisma.radiology_order.create({
          data: {
            visit_id,
            exam_type_id: order.exam_type_id,
            notes: order.notes,
            status: order.status || 'pending',
            patient_id: visit.patient_id,
            organisation_id: visit.organisation_id,
            ordered_at: formatDateToDDMMYYYY(new Date()),
            doctor_id: visit.doctor_id || undefined,
            result: order.result || null,
            result_date: order.result_date || null
          },
          include: {
            exam_type: true
          }
        })
      )
    )

    if (includeVisitData) {
      const updatedVisit = await prisma.patient_visit.findUnique({
        where: { id: visit_id },
        include: {
          radiology_orders: {
            include: {
              exam_type: true
            }
          }
        }
      })

      return { orders: createdOrders, visit: updatedVisit }
    }

    return { orders: createdOrders }
  } catch (error) {
    console.error('Error in createRadiologyOrders:', error)
    throw new Error('Failed to create radiology orders')
  }
}

export async function updateRadiologyOrder(id: number, data: any, includeVisitData: boolean = true) {
  try {
    const { exam_type_id, notes, status, result, result_date } = data

    // Only update result_date if result is provided
    const updateData: any = {
      exam_type_id,
      notes,
      status,
      result
    }

    if (result) {
      // Convert YYYY-MM-DD to DD/MM/YYYY if result_date is provided, otherwise use current date
      const [year, month, day] = (result_date || '').split('-')

      updateData.result_date = result_date ? `${day}/${month}/${year}` : formatDateToDDMMYYYY(new Date())
    }

    const order = await prisma.radiology_order.update({
      where: { id },
      data: updateData,
      include: {
        exam_type: true
      }
    })

    if (!order.visit_id) {
      throw new Error('Visit ID not found')
    }

    if (includeVisitData) {
      const visit = await prisma.patient_visit.findUnique({
        where: { id: order.visit_id },
        include: {
          radiology_orders: {
            include: {
              exam_type: true
            }
          }
        }
      })

      return { order, visit }
    }

    return { order }
  } catch (error) {
    console.error('Error in updateRadiologyOrder:', error)
    throw new Error('Failed to update radiology order')
  }
}

export async function deleteRadiologyOrder(id: number, includeVisitData: boolean = true) {
  try {
    // Get the order to find the visit_id for updating the visit data
    const order = await prisma.radiology_order.findUnique({
      where: { id },
      select: { visit_id: true }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Delete the order
    await prisma.radiology_order.delete({
      where: { id }
    })

    // If the order was associated with a visit and we want visit data, fetch the updated visit data
    if (order.visit_id && includeVisitData) {
      const updatedVisit = await prisma.patient_visit.findUnique({
        where: { id: order.visit_id },
        include: {
          radiology_orders: {
            include: {
              exam_type: true
            }
          }
        }
      })

      return { success: true, visit: updatedVisit }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteRadiologyOrder:', error)
    throw new Error('Failed to delete radiology order')
  }
}

// Additional utility functions

export async function getRadiologyOrderById(id: number) {
  try {
    const order = await prisma.radiology_order.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true
          }
        },
        visit: true,
        exam_type: true
      }
    })

    if (!order) {
      throw new Error('Radiology order not found')
    }

    return order
  } catch (error) {
    console.error('Error in getRadiologyOrderById:', error)
    throw new Error('Failed to fetch radiology order')
  }
}

export async function getRadiologyOrdersByPatient(patientId: number, orderBy?: any) {
  try {
    const orders = await prisma.radiology_order.findMany({
      where: {
        patient_id: patientId
      },
      include: {
        exam_type: true,
        doctor: true,
        visit: true
      },
      orderBy: orderBy || {
        ordered_at: 'desc'
      }
    })

    return orders
  } catch (error) {
    console.error('Error in getRadiologyOrdersByPatient:', error)
    throw new Error('Failed to fetch radiology orders')
  }
}

export async function getRadiologyOrdersByDoctor(doctorId: number, orderBy?: any) {
  try {
    const orders = await prisma.radiology_order.findMany({
      where: {
        doctor_id: doctorId
      },
      include: {
        exam_type: true,
        patient: true,
        visit: true
      },
      orderBy: orderBy || {
        ordered_at: 'desc'
      }
    })

    return orders
  } catch (error) {
    console.error('Error in getRadiologyOrdersByDoctor:', error)
    throw new Error('Failed to fetch radiology orders')
  }
}
