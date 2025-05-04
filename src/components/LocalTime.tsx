'use client'
import React from 'react'

export function LocalDate({ iso }: { iso: string }) {
  return <>{new Date(iso).toLocaleDateString()}</>
}

export function LocalTime({ iso }: { iso: string }) {
  return <>{new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
}
