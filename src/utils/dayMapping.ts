/**
 * Maps day names from different languages to English lowercase format
 * Used for consistent translation key access across the application
 */
export const mapDayToEnglish = (day: string): string => {
  const dayMap: { [key: string]: string } = {
    // French to English
    lundi: 'monday',
    mardi: 'tuesday',
    mercredi: 'wednesday',
    jeudi: 'thursday',
    vendredi: 'friday',
    samedi: 'saturday',
    dimanche: 'sunday',

    // Arabic to English
    الاثنين: 'monday',
    الثلاثاء: 'tuesday',
    الأربعاء: 'wednesday',
    الخميس: 'thursday',
    الجمعة: 'friday',
    السبت: 'saturday',
    الأحد: 'sunday',

    // Keep English days as is
    monday: 'monday',
    tuesday: 'tuesday',
    wednesday: 'wednesday',
    thursday: 'thursday',
    friday: 'friday',
    saturday: 'saturday',
    sunday: 'sunday'
  }

  return dayMap[day.toLowerCase()] || day.toLowerCase()
}
