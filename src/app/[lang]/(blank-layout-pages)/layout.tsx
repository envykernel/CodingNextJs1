// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

type Props = ChildrenType & {
  params: Promise<{ lang: Locale }>
}

const Layout = async (props: Props) => {
  const params = await props.params
  const { children } = props

  // Vars
  const direction = i18n.langDirection[params.lang]
  const [systemMode, dictionary] = await Promise.all([getSystemMode(), getDictionary(params.lang)])

  return (
    <Providers direction={direction} dictionary={dictionary}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
