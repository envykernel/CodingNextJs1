import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import PrescriptionsListClient from '@/components/prescriptions/PrescriptionsListClient'

export default async function PrescriptionsListPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang)

  return <PrescriptionsListClient dictionary={dictionary} />
}
