// Component Imports
import FAQ from '@views/pages/faq'
import { getFaqData } from '@/app/server/actions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/faq` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getFaqData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/faq`)

  if (!res.ok) {
    throw new Error('Failed to fetch faqData')
  }

  return res.json()
} */

const FaqPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  // First await the params object
  const { lang } = await params

  // Then await both async operations in parallel
  const [data, dictionary] = await Promise.all([getFaqData(), getDictionary(lang)])

  return (
    <TranslationProvider dictionary={dictionary}>
      <FAQ data={data} />
    </TranslationProvider>
  )
}

export default FaqPage
