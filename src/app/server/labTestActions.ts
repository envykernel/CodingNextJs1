'use server'

import { prisma } from '@/libs/prisma'

export type LabTestOrderItem = {
  id: number
  patient_id: number
  visit_id: number | null
  doctor_id: number | null
  test_type_id: number
  organisation_id: number
  ordered_at: Date | null
  result_value: string | null
  result_unit: string | null
  reference_range: string | null
  status: string | null
  notes: string | null
  result_flag: string | null
  test_type: {
    id: number
    name: string
    category: string | null
    default_unit: string | null
    default_reference_range: string | null
    created_at: Date | null
    updated_at: Date | null
  }
}

export interface LabTestOrderWithGrouping {
  id: number
  patient_id: number
  visit_id: number | null
  doctor_id: number | null
  test_type_id: number
  organisation_id: number
  ordered_at: Date | null
  result_value: string | null
  result_unit: string | null
  reference_range: string | null
  status: string | null
  notes: string | null
  result_flag: string | null
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
  test_type: {
    id: number
    name: string
    category: string | null
    default_unit: string | null
    default_reference_range: string | null
    created_at: Date | null
    updated_at: Date | null
  }
  visit: {
    id: number
    visit_date: Date
    start_time: string
    end_time: string
    status: string
  } | null
  items: LabTestOrderItem[]
  groupedItems: Record<string, LabTestOrderItem[]>
}

export async function getLabTestOrder(id: string): Promise<LabTestOrderWithGrouping> {
  try {
    // First get the current lab test order to get the visit_id
    const currentLabTestOrder = await prisma.lab_test_order.findUnique({
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
        test_type: true,
        visit: true
      }
    })

    if (!currentLabTestOrder) {
      throw new Error('Lab test order not found')
    }

    // If there's a visit_id, get all lab test orders for this visit
    if (currentLabTestOrder.visit_id) {
      const allLabTestOrders = await prisma.lab_test_order.findMany({
        where: {
          visit_id: currentLabTestOrder.visit_id,
          patient_id: currentLabTestOrder.patient_id
        },
        include: {
          test_type: true
        },
        orderBy: [{ test_type: { category: 'asc' } }, { ordered_at: 'asc' }]
      })

      // Group the orders by category
      const groupedOrders = allLabTestOrders.reduce(
        (acc, order) => {
          const category = order.test_type.category || 'Non catégorisé'

          if (!acc[category]) {
            acc[category] = []
          }

          acc[category].push(order)

          return acc
        },
        {} as Record<string, typeof allLabTestOrders>
      )

      // Return the current order with grouped orders
      return {
        ...currentLabTestOrder,
        items: allLabTestOrders,
        groupedItems: groupedOrders
      }
    }

    // If no visit_id, just return the single order
    const category = currentLabTestOrder.test_type.category || 'Non catégorisé'

    return {
      ...currentLabTestOrder,
      items: [currentLabTestOrder],
      groupedItems: {
        [category]: [currentLabTestOrder]
      }
    }
  } catch (error) {
    console.error('Error in getLabTestOrder:', error)
    throw new Error('Failed to fetch lab test order')
  }
}

// Additional utility functions for lab tests

export async function getLabTestOrdersByPatient(patientId: number, orderBy?: any) {
  try {
    const labTestOrders = await prisma.lab_test_order.findMany({
      where: {
        patient_id: patientId
      },
      include: {
        doctor: {
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
        test_type: true,
        visit: {
          select: {
            id: true,
            visit_date: true
          }
        }
      },
      orderBy: orderBy || {
        ordered_at: 'desc'
      }
    })

    return labTestOrders
  } catch (error) {
    console.error('Error in getLabTestOrdersByPatient:', error)
    throw new Error('Failed to fetch lab test orders')
  }
}

export async function getLabTestOrdersByVisit(visitId: number, orderBy?: any) {
  try {
    const labTestOrders = await prisma.lab_test_order.findMany({
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
        doctor: {
          select: {
            id: true,
            name: true
          }
        },
        test_type: true
      },
      orderBy: orderBy || {
        ordered_at: 'asc'
      }
    })

    return labTestOrders
  } catch (error) {
    console.error('Error in getLabTestOrdersByVisit:', error)
    throw new Error('Failed to fetch lab test orders')
  }
}

export async function getLabTestOrdersByOrganisation(organisationId: number, orderBy?: any) {
  try {
    const labTestOrders = await prisma.lab_test_order.findMany({
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
        doctor: {
          select: {
            id: true,
            name: true
          }
        },
        test_type: true,
        visit: {
          select: {
            id: true,
            visit_date: true
          }
        }
      },
      orderBy: orderBy || {
        ordered_at: 'desc'
      }
    })

    return labTestOrders
  } catch (error) {
    console.error('Error in getLabTestOrdersByOrganisation:', error)
    throw new Error('Failed to fetch lab test orders')
  }
}

export async function getLabTestOrdersByStatus(status: string, organisationId?: number, orderBy?: any) {
  try {
    const labTestOrders = await prisma.lab_test_order.findMany({
      where: {
        status: status,
        ...(organisationId && { organisation_id: organisationId })
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true
          }
        },
        test_type: true,
        visit: {
          select: {
            id: true,
            visit_date: true
          }
        }
      },
      orderBy: orderBy || {
        ordered_at: 'desc'
      }
    })

    return labTestOrders
  } catch (error) {
    console.error('Error in getLabTestOrdersByStatus:', error)
    throw new Error('Failed to fetch lab test orders')
  }
}

export async function createLabTestOrder(data: any) {
  try {
    const { patient_id, visit_id, doctor_id, test_type_id, organisation_id, notes } = data

    const labTestOrder = await prisma.lab_test_order.create({
      data: {
        patient_id,
        visit_id,
        doctor_id,
        test_type_id,
        organisation_id,
        ordered_at: new Date(),
        status: 'pending',
        notes
      },
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
        test_type: true,
        visit: true
      }
    })

    return labTestOrder
  } catch (error) {
    console.error('Error in createLabTestOrder:', error)
    throw new Error('Failed to create lab test order')
  }
}

export async function updateLabTestOrder(id: number, data: any) {
  try {
    const { result_value, result_unit, reference_range, status, notes, result_flag } = data

    const labTestOrder = await prisma.lab_test_order.update({
      where: { id },
      data: {
        ...(result_value && { result_value }),
        ...(result_unit && { result_unit }),
        ...(reference_range && { reference_range }),
        ...(status && { status }),
        ...(notes && { notes }),
        ...(result_flag && { result_flag })
      },
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
        test_type: true,
        visit: true
      }
    })

    return labTestOrder
  } catch (error) {
    console.error('Error in updateLabTestOrder:', error)
    throw new Error('Failed to update lab test order')
  }
}

export async function deleteLabTestOrder(id: number) {
  try {
    await prisma.lab_test_order.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error('Error in deleteLabTestOrder:', error)
    throw new Error('Failed to delete lab test order')
  }
}

export async function getLabTestTypes(orderBy?: any) {
  try {
    const testTypes = await prisma.lab_test_type.findMany({
      orderBy: orderBy || {
        category: 'asc',
        name: 'asc'
      }
    })

    return testTypes
  } catch (error) {
    console.error('Error in getLabTestTypes:', error)
    throw new Error('Failed to fetch lab test types')
  }
}

export async function getLabTestTypesByCategory(category: string, orderBy?: any) {
  try {
    const testTypes = await prisma.lab_test_type.findMany({
      where: {
        category: category
      },
      orderBy: orderBy || {
        name: 'asc'
      }
    })

    return testTypes
  } catch (error) {
    console.error('Error in getLabTestTypesByCategory:', error)
    throw new Error('Failed to fetch lab test types')
  }
}
