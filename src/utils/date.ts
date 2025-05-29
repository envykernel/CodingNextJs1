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
