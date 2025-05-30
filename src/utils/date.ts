export function calculateAge(birthdate: string | Date): number | undefined {
  if (!birthdate) return undefined
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Formats a date string or Date object to DD/MM/YYYY format
 * @param date - The date to format (string or Date object)
 * @returns The formatted date string in DD/MM/YYYY format
 */
export function formatDateToDDMMYYYY(date: string | Date): string {
  if (!date) return '-'
  const dateObj = new Date(date)

  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formats a date string to DD/MM/YYYY format, handling both YYYY-MM-DD and DD/MM/YYYY inputs
 * @param dateStr - The date string to format (can be in YYYY-MM-DD or DD/MM/YYYY format)
 * @returns The formatted date string in DD/MM/YYYY format, or empty string if invalid
 */
export function formatRadiologyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''

  // If date is already in DD/MM/YYYY format, return as is
  if (dateStr.includes('/')) return dateStr

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const [year, month, day] = dateStr.split('-')

  return `${day}/${month}/${year}`
}
