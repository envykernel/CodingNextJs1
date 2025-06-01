'use client'

// Third-party Imports
import { useEffect, useState } from 'react'

import classnames from 'classnames'

// Type Imports
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutsType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        const response = await fetch('/api/shortcuts')

        if (!response.ok) {
          throw new Error(`Failed to fetch shortcuts: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        setShortcuts(data)
        setError(null)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch shortcuts')

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

    fetchShortcuts()
  }, [])

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center'>
        <LanguageDropdown />
        <ModeDropdown />
        {!loading && !error && <ShortcutsDropdown shortcuts={shortcuts} />}
        <NotificationsDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
