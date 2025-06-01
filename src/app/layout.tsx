import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

import { getSystemMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Medical App',
  description: 'Medical Application Dashboard'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const systemMode = await getSystemMode()

  return (
    <html id='__next' lang='fr' dir='ltr' suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        {children}
      </body>
    </html>
  )
}
