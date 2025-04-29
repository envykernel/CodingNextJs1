import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import ViewPrescriptionClient from '@/components/prescriptions/ViewPrescriptionClient'

export default async function ViewPrescriptionPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang)

  return <ViewPrescriptionClient dictionary={dictionary} />
}
