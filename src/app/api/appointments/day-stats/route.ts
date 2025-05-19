import { NextResponse } from 'next/server'

import { startOfWeek, endOfWeek, startOfYear, format, parseISO } from 'date-fns'

import type { patient_appointment } from '@prisma/client'

import { prisma } from '@/prisma/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    let startDate: Date
    let endDate: Date
    const now = new Date()

    if (startDateParam && endDateParam) {
      // Use custom date range if provided
      startDate = parseISO(startDateParam)
      endDate = parseISO(endDateParam)
    } else if (range === 'year') {
      // Default to year-to-date if range is 'year'
      startDate = startOfYear(now)
      endDate = endOfWeek(now, { weekStartsOn: 1 })
    } else {
      // Default to current week if no dates provided
      startDate = startOfWeek(now, { weekStartsOn: 1 })
      endDate = endOfWeek(now, { weekStartsOn: 1 })
    }

    // Get all non-cancelled appointments for the specified date range
    const appointments = await prisma.patient_appointment.findMany({
      where: {
        appointment_date: {
          gte: startDate,
          lte: endDate
        },
        status: {
          notIn: ['cancelled', 'Cancelled']
        }
      },
      select: {
        appointment_date: true
      }
    })

    // Initialize counts for each day of the week (Monday to Sunday)
    const dayCounts = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0
    }

    // Count appointments for each day
    appointments.forEach((appointment: Pick<patient_appointment, 'appointment_date'>) => {
      const day = format(appointment.appointment_date, 'EEEE')

      dayCounts[day as keyof typeof dayCounts]++
    })

    // Calculate total appointments
    const totalAppointments = Object.values(dayCounts).reduce((sum, count) => sum + count, 0)

    // Convert to array with percentages
    const stats = Object.entries(dayCounts).map(([day, count]) => ({
      day,
      count,
      percentage: totalAppointments > 0 ? (count / totalAppointments) * 100 : 0
    }))

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching appointment statistics:', error)

    return NextResponse.json({ error: 'Failed to fetch appointment statistics' }, { status: 500 })
  }
}
