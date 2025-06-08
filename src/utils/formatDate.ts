import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: Date | string | null): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  return format(dateObj, 'dd MMMM yyyy', { locale: fr })
}
