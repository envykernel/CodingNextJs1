// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export default async function AccessDeniedLayout({ children }: { children: React.ReactNode }) {
  // Get system mode and dictionary
  const [systemMode, dictionary] = await Promise.all([getSystemMode(), getDictionary('fr')])

  return (
    <Providers direction='ltr' dictionary={dictionary}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
    </Providers>
  )
}
