// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getServerMode, getSystemMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

const NotFoundPage = async (props: { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params

  // Vars
  const direction = i18n.langDirection[params.lang]
  const mode = await getServerMode()
  const systemMode = await getSystemMode()
  const dictionary = await getDictionary(params.lang)

  return (
    <Providers direction={direction} dictionary={dictionary}>
      <BlankLayout systemMode={systemMode}>
        <NotFound mode={mode} />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
