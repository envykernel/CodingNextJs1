import specialtiesData from '@/data/medicalSpecialties.json'

export type Specialty = {
  id: string
  translations: {
    fr: string
    en: string
    ar: string
  }
}

export const getSpecialties = (): Specialty[] => {
  return specialtiesData.specialties
}

export const getSpecialtyTranslation = (specialtyId: string, lang: string): string => {
  const specialty = specialtiesData.specialties.find(s => s.id === specialtyId)

  if (!specialty) return specialtyId

  return specialty.translations[lang as keyof typeof specialty.translations] || specialtyId
}

export const getSpecialtyById = (specialtyId: string): Specialty | undefined => {
  return specialtiesData.specialties.find(s => s.id === specialtyId)
}
