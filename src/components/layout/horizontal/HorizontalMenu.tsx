// Next Imports
import { useState } from 'react'

import { useParams } from 'next/navigation'

// Third-party Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'
import type { getDictionary } from '@/utils/getDictionary'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'
import EditOrganisationDrawer from '@/components/organisation/EditOrganisationDrawer'
import ServicesDrawer from '@/components/services/ServicesDrawer'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useTranslation } from '@/contexts/translationContext'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/horizontalMenuData'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='tabler-chevron-right' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HorizontalMenu = (props: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const params = useParams() as { lang: string }
  const { t } = useTranslation()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const isCabinetManager = session?.user?.role === 'CABINET_MANAGER'
  const canManageOrg = isAdmin || isCabinetManager

  // State
  const [organisationDrawerOpen, setOrganisationDrawerOpen] = useState(false)
  const [servicesDrawerOpen, setServicesDrawerOpen] = useState(false)

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const handleOrganisationClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setOrganisationDrawerOpen(true)
  }

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setServicesDrawerOpen(true)
  }

  const handleOrganisationUpdated = () => {
    // Update the session with new organisation data
    // This will trigger a re-render with updated data
    window.location.reload()
  }

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-paper)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        <SubMenu label={t('sidebar.navigation.dashboards')} icon={<i className='tabler-smart-home' />}>
          {isAdmin && (
            <>
              <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='tabler-chart-pie-2' />}>
                {t('sidebar.navigation.crm')}
              </MenuItem>
              <MenuItem href={`/${locale}/dashboards/analytics`} icon={<i className='tabler-trending-up' />}>
                {t('sidebar.navigation.analytics')}
              </MenuItem>
              <MenuItem href={`/${locale}/dashboards/ecommerce`} icon={<i className='tabler-shopping-cart' />}>
                {t('sidebar.navigation.eCommerce')}
              </MenuItem>
              <MenuItem href={`/${locale}/dashboards/academy`} icon={<i className='tabler-school' />}>
                {t('sidebar.navigation.academy')}
              </MenuItem>
              <MenuItem href={`/${locale}/dashboards/logistics`} icon={<i className='tabler-truck' />}>
                {t('sidebar.navigation.logistics')}
              </MenuItem>
            </>
          )}
          <MenuItem href={`/${locale}/dashboards/organization`} icon={<i className='tabler-building' />}>
            {t('sidebar.navigation.organization')}
          </MenuItem>
          {(isAdmin || isCabinetManager) && (
            <MenuItem href={`/${locale}/dashboards/finance`} icon={<i className='tabler-cash' />}>
              {t('sidebar.navigation.finance')}
            </MenuItem>
          )}
        </SubMenu>
        <SubMenu label={t('sidebar.navigation.medical')} icon={<i className='tabler-stethoscope' />}>
          <MenuItem href={`/${locale}/apps/patient/list`} icon={<i className='tabler-users' />}>
            {t('sidebar.navigation.patients')}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/appointments/list`} icon={<i className='tabler-calendar-event' />}>
            {t('sidebar.navigation.appointments')}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/medical-certificates/list`} icon={<i className='tabler-file-certificate' />}>
            {t('sidebar.navigation.medicalCertificates')}
          </MenuItem>
        </SubMenu>
        <SubMenu label={t('sidebar.navigation.financial')} icon={<i className='tabler-cash' />}>
          <MenuItem href={`/${locale}/apps/invoice/list`} icon={<i className='tabler-file-invoice' />}>
            {t('sidebar.navigation.invoices')}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/invoice/add`} icon={<i className='tabler-file-plus' />}>
            {t('sidebar.navigation.createInvoice')}
          </MenuItem>
        </SubMenu>
        {canManageOrg && (
          <SubMenu label={t('sidebar.navigation.administration')} icon={<i className='tabler-settings' />}>
            {(isAdmin || isCabinetManager) && (
              <MenuItem href={`/${locale}/pages/users-management`} icon={<i className='tabler-users' />}>
                {t('sidebar.navigation.userManagement')}
              </MenuItem>
            )}
            <MenuItem onClick={handleOrganisationClick} icon={<i className='tabler-building' />}>
              {t('sidebar.navigation.organisation')}
            </MenuItem>
            <MenuItem onClick={handleServicesClick} icon={<i className='tabler-tools' />}>
              {t('sidebar.navigation.services')}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/medications/list`} icon={<i className='tabler-pill' />}>
              {t('sidebar.navigation.medications')}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/doctors/list`} icon={<i className='tabler-stethoscope' />}>
              {t('sidebar.navigation.doctors')}
            </MenuItem>
          </SubMenu>
        )}
      </Menu>
      {/* <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        <GenerateHorizontalMenu menuData={menuData(dictionary)} />
      </Menu> */}

      <EditOrganisationDrawer
        open={organisationDrawerOpen}
        onClose={() => setOrganisationDrawerOpen(false)}
        onOrganisationUpdated={handleOrganisationUpdated}
      />

      <ServicesDrawer open={servicesDrawerOpen} onClose={() => setServicesDrawerOpen(false)} />
    </HorizontalNav>
  )
}

export default HorizontalMenu
