import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import CreatePrescriptionClient from '@/components/prescriptions/CreatePrescriptionClient'

export default async function CreatePrescriptionPage({ params }: { params: { lang: Locale } }) {
  try {
    const dictionary = await getDictionary(params.lang)

    return <CreatePrescriptionClient dictionary={dictionary} />
  } catch (error) {
    console.error('Error loading dictionary:', error)

    return null
  }
}
