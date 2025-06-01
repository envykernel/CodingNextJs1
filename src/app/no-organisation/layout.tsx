import type { Metadata } from 'next'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata: Metadata = {
  title: 'No Organization',
  description: 'Organization not found or not accessible'
}

export default async function NoOrganisationLayout({ children }: { children: React.ReactNode }) {
  // Get system mode and dictionary
  const [systemMode, dictionary] = await Promise.all([getSystemMode(), getDictionary('fr')])

  return (
    <html id='__next' lang='fr' dir='ltr' suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <Providers direction='ltr' dictionary={dictionary}>
          <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
        </Providers>
      </body>
    </html>
  )
}
