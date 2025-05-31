import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'No Organization',
  description: 'Organization not found or not accessible'
}

export default function NoOrganizationLayout({ children }: { children: React.ReactNode }) {
  return <div className='flex min-h-screen flex-col items-center justify-center p-4'>{children}</div>
}
