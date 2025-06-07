// Next Imports
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import { useSession } from 'next-auth/react'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import { getLocalizedUrl } from '@/utils/i18n'

const NavbarContent = () => {
  // States
  const [shortcuts, setShortcuts] = useState<ShortcutsType[]>([])
  const [loading, setLoading] = useState(true)

  // Hooks
  const { isBreakpointReached } = useHorizontalNav()
  const params = useParams<{ lang: string }>()
  const locale = params?.lang as Locale
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        const response = await fetch('/api/shortcuts')

        if (!response.ok) {
          throw new Error('Failed to fetch shortcuts')
        }

        const data = await response.json()

        setShortcuts(data)
      } catch (error) {
        // Set default shortcuts if fetch fails
        setShortcuts([
          {
            url: '/',
            icon: 'tabler-device-desktop-analytics',
            title: 'Dashboard',
            subtitle: 'User Dashboard'
          },
          {
            url: '/pages/account-settings',
            icon: 'tabler-settings',
            title: 'Settings',
            subtitle: 'Account Settings'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchShortcuts()

    // Listen for shortcuts updates
    const handleShortcutsUpdate = () => {
      fetchShortcuts()
    }

    window.addEventListener('shortcutsUpdated', handleShortcutsUpdate)

    // Cleanup
    return () => {
      window.removeEventListener('shortcutsUpdated', handleShortcutsUpdate)
    }
  }, [])

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && (
          <Link href={getLocalizedUrl('/dashboards/organization', locale)}>
            <Logo />
          </Link>
        )}
      </div>

      <div className='flex items-center'>
        {isAdmin && <NavSearch />}
        <LanguageDropdown />
        <ModeDropdown />
        {!loading && <ShortcutsDropdown shortcuts={shortcuts} />}
        <NotificationsDropdown />
        <UserDropdown />
        {/* Language Dropdown, Notification Dropdown, quick access menu dropdown, user dropdown will be placed here */}
      </div>
    </div>
  )
}

export default NavbarContent
