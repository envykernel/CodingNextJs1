// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'
import CustomChip from '@core/components/mui/Chip'

// import { GenerateHorizontalMenu } from '@components/GenerateMenu'

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

const HorizontalMenu = () => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const params = useParams() as { lang: string }
  const { t } = useTranslation()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params

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
          <MenuItem href={`/${locale}/dashboards/organization`} icon={<i className='tabler-building' />}>
            {t('sidebar.navigation.organization')}
          </MenuItem>
        </SubMenu>
        <SubMenu label={t('sidebar.navigation.medical')} icon={<i className='tabler-stethoscope' />}>
          <MenuItem href={`/${locale}/apps/patient/list`} icon={<i className='tabler-users' />}>
            {t('sidebar.navigation.patients')}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/appointments/list`} icon={<i className='tabler-calendar-event' />}>
            {t('sidebar.navigation.appointments')}
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
        <SubMenu label={t('sidebar.navigation.administration')} icon={<i className='tabler-settings' />}>
          <MenuItem href={`/${locale}/pages/users-management`} icon={<i className='tabler-users' />}>
            {t('sidebar.navigation.userManagement')}
          </MenuItem>
          <MenuItem href={`/${locale}/administration/organisation`} icon={<i className='tabler-building' />}>
            {t('sidebar.navigation.organisation')}
          </MenuItem>
          <MenuItem href={`/${locale}/administration/services`} icon={<i className='tabler-tools' />}>
            {t('sidebar.navigation.services')}
          </MenuItem>
        </SubMenu>
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
    </HorizontalNav>
  )
}

export default HorizontalMenu
