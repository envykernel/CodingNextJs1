'use client'
import React from 'react'

import { format } from 'date-fns'

export function LocalDate({ iso }: { iso: string }) {
  if (!iso) return <>-</>
  return <>{format(new Date(iso), 'dd/MM/yyyy')}</>
}

export function LocalTime({ iso }: { iso: string }) {
  if (!iso) return <>-</>

  // Check if the input is a time-only string (HH:mm)
  if (/^\d{2}:\d{2}$/.test(iso)) {
    return <>{iso}</>
  }

  try {
    return <>{format(new Date(iso), 'HH:mm')}</>
  } catch (error) {
    console.error('Invalid time value:', iso)
    return <>-</>
  }
}
