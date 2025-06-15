'use client'

// Next Imports
import Link from 'next/link'

import Button from '@mui/material/Button'

// MUI Imports
import useScrollTrigger from '@mui/material/useScrollTrigger'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import ModeDropdown from '@components/layout/shared/ModeDropdown'

// Util Imports
import { frontLayoutClasses } from '@layouts/utils/layoutClasses'

// Styles Imports
import styles from './styles.module.css'

const Header = () => {
  // Detect window scroll
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  })

  return (
    <header className={classnames(frontLayoutClasses.header, styles.header)}>
      <div className={classnames(frontLayoutClasses.navbar, styles.navbar, { [styles.headerScrolled]: trigger })}>
        <div className={classnames(frontLayoutClasses.navbarContent, styles.navbarContent)}>
          <div className='flex items-center gap-2 sm:gap-4'>
            <Link href='/front-pages/landing-page'>
              <Logo />
            </Link>
          </div>
          <div className='flex items-center gap-2 sm:gap-4'>
            <ModeDropdown />
            <Button
              component={Link}
              href='/'
              variant='outlined'
              color='primary'
              className='font-medium'
              startIcon={<i className='tabler-home text-[1.25rem]' />}
            >
              Accueil
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
