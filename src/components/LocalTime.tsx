'use client'
import React from 'react'

import { format } from 'date-fns'

export function LocalDate({ iso }: { iso: string }) {
  return <>{format(new Date(iso), 'dd/MM/yyyy')}</>
}

export function LocalTime({ iso }: { iso: string }) {
  return <>{format(new Date(iso), 'HH:mm')}</>
}
