// Component Imports
import CommercialWrapper from '@/views/front-pages/commercial'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'

// Data Imports
import { getPricingData } from '@/app/server/actions'

// Type Imports
import type { Locale } from '@configs/i18n'

const CommercialPage = async ({ params }: { params: { lang: Locale } }) => {
  // Get pricing data and dictionary
  const [data, dictionary] = await Promise.all([getPricingData(), getDictionary(params.lang)])

  return (
    <TranslationProvider dictionary={dictionary}>
      <CommercialWrapper data={data} />
    </TranslationProvider>
  )
}

export default CommercialPage
