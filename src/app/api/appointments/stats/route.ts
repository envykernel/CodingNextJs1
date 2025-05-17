import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

function getMonthRange() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return { startOfMonth, endOfMonth }
}

function getPreviousMonthRange() {
  const now = new Date()
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  return { startOfPreviousMonth, endOfPreviousMonth }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0

  return Math.round(((current - previous) / previous) * 100)
}

interface AppointmentStats {
  current: {
    total: number
    completed: number
    scheduled: number
    cancelled: number
  }
  previous: {
    total: number
    completed: number
    scheduled: number
    cancelled: number
  }
  changes: {
    total: number
    completed: number
    scheduled: number
    cancelled: number
  }
}

export async function GET() {
  try {
    const { startOfMonth, endOfMonth } = getMonthRange()
    const { startOfPreviousMonth, endOfPreviousMonth } = getPreviousMonthRange()

    // Get current month stats
    const [currentMonthStats, previousMonthStats] = await Promise.all([
      // Current month stats
      prisma.patient_appointment.groupBy({
        by: ['status'],
        where: {
          appointment_date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _count: true
      }),

      // Previous month stats
      prisma.patient_appointment.groupBy({
        by: ['status'],
        where: {
          appointment_date: {
            gte: startOfPreviousMonth,
            lte: endOfPreviousMonth
          }
        },
        _count: true
      })
    ])

    // Process current month stats
    const currentStats = {
      total: 0,
      completed: 0,
      scheduled: 0,
      cancelled: 0
    }

    currentMonthStats.forEach(stat => {
      currentStats.total += stat._count
      const status = stat.status?.toLowerCase() || ''

      switch (status) {
        case 'completed':
          currentStats.completed = stat._count
          break
        case 'scheduled':
          currentStats.scheduled = stat._count
          break
        case 'cancelled':
          currentStats.cancelled = stat._count
          break
      }
    })

    // Process previous month stats
    const previousStats = {
      total: 0,
      completed: 0,
      scheduled: 0,
      cancelled: 0
    }

    previousMonthStats.forEach(stat => {
      previousStats.total += stat._count
      const status = stat.status?.toLowerCase() || ''

      switch (status) {
        case 'completed':
          previousStats.completed = stat._count
          break
        case 'scheduled':
          previousStats.scheduled = stat._count
          break
        case 'cancelled':
          previousStats.cancelled = stat._count
          break
      }
    })

    // Calculate percentage changes
    const stats: AppointmentStats = {
      current: currentStats,
      previous: previousStats,
      changes: {
        total: calculatePercentageChange(currentStats.total, previousStats.total),
        completed: calculatePercentageChange(currentStats.completed, previousStats.completed),
        scheduled: calculatePercentageChange(currentStats.scheduled, previousStats.scheduled),
        cancelled: calculatePercentageChange(currentStats.cancelled, previousStats.cancelled)
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching appointment stats:', error)

    return NextResponse.json({ error: 'Failed to fetch appointment statistics' }, { status: 500 })
  }
}
