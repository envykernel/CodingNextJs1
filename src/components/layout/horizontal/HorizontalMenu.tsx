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
        <SubMenu label={t('sidebar.navigation.apps')} icon={<i className='tabler-mail' />}>
          <SubMenu label={t('sidebar.navigation.eCommerce')} icon={<i className='tabler-shopping-cart' />}>
            <MenuItem href={`/${locale}/apps/ecommerce/dashboard`}>{t('sidebar.navigation.dashboard')}</MenuItem>
            <SubMenu label={t('sidebar.navigation.products')}>
              <MenuItem href={`/${locale}/apps/ecommerce/products/list`}>{t('sidebar.navigation.list')}</MenuItem>
              <MenuItem href={`/${locale}/apps/ecommerce/products/add`}>{t('sidebar.navigation.add')}</MenuItem>
              <MenuItem href={`/${locale}/apps/ecommerce/products/category`}>
                {t('sidebar.navigation.category')}
              </MenuItem>
            </SubMenu>
            <SubMenu label={t('sidebar.navigation.orders')}>
              <MenuItem href={`/${locale}/apps/ecommerce/orders/list`}>{t('sidebar.navigation.list')}</MenuItem>
              <MenuItem
                href={`/${locale}/apps/ecommerce/orders/details/5434`}
                exactMatch={false}
                activeUrl='/apps/ecommerce/orders/details'
              >
                {t('sidebar.navigation.details')}
              </MenuItem>
            </SubMenu>
            <SubMenu label={t('sidebar.navigation.customers')}>
              <MenuItem href={`/${locale}/apps/ecommerce/customers/list`}>{t('sidebar.navigation.list')}</MenuItem>
              <MenuItem
                href={`/${locale}/apps/ecommerce/customers/details/879861`}
                exactMatch={false}
                activeUrl='/apps/ecommerce/customers/details'
              >
                {t('sidebar.navigation.details')}
              </MenuItem>
            </SubMenu>
            <MenuItem href={`/${locale}/apps/ecommerce/manage-reviews`}>
              {t('sidebar.navigation.manageReviews')}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/referrals`}>{t('sidebar.navigation.referrals')}</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/settings`}>{t('sidebar.navigation.settings')}</MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.academy')} icon={<i className='tabler-school' />}>
            <MenuItem href={`/${locale}/apps/academy/dashboard`}>{t('sidebar.navigation.dashboard')}</MenuItem>
            <MenuItem href={`/${locale}/apps/academy/my-courses`}>{t('sidebar.navigation.myCourses')}</MenuItem>
            <MenuItem href={`/${locale}/apps/academy/course-details`}>{t('sidebar.navigation.courseDetails')}</MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.logistics')} icon={<i className='tabler-truck' />}>
            <MenuItem href={`/${locale}/apps/logistics/dashboard`}>{t('sidebar.navigation.dashboard')}</MenuItem>
            <MenuItem href={`/${locale}/apps/logistics/fleet`}>{t('sidebar.navigation.fleet')}</MenuItem>
          </SubMenu>
          <MenuItem
            href={`/${locale}/apps/email`}
            icon={<i className='tabler-mail' />}
            exactMatch={false}
            activeUrl='/apps/email'
          >
            {t('sidebar.navigation.email')}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/chat`} icon={<i className='tabler-message-circle-2' />}>
            {t('sidebar.navigation.chat')}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/calendar`} icon={<i className='tabler-calendar' />}>
            {t('sidebar.navigation.calendar')}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/kanban`} icon={<i className='tabler-copy' />}>
            {t('sidebar.navigation.kanban')}
          </MenuItem>
          <SubMenu label={t('sidebar.navigation.invoice')} icon={<i className='tabler-file-description' />}>
            <MenuItem href={`/${locale}/apps/invoice/list`}>{t('sidebar.navigation.list')}</MenuItem>
            <MenuItem
              href={`/${locale}/apps/invoice/preview/4987`}
              exactMatch={false}
              activeUrl='/apps/invoice/preview'
            >
              {t('sidebar.navigation.preview')}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/invoice/edit/4987`} exactMatch={false} activeUrl='/apps/invoice/edit'>
              {t('sidebar.navigation.edit')}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/invoice/add`}>{t('sidebar.navigation.add')}</MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.user')} icon={<i className='tabler-user' />}>
            <MenuItem href={`/${locale}/apps/user/list`}>{t('sidebar.navigation.list')}</MenuItem>
            <MenuItem href={`/${locale}/apps/user/view`}>{t('sidebar.navigation.view')}</MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.rolesPermissions')} icon={<i className='tabler-lock' />}>
            <MenuItem href={`/${locale}/apps/roles`}>{t('sidebar.navigation.roles')}</MenuItem>
            <MenuItem href={`/${locale}/apps/permissions`}>{t('sidebar.navigation.permissions')}</MenuItem>
          </SubMenu>
        </SubMenu>
        <SubMenu label={t('sidebar.navigation.pages')} icon={<i className='tabler-file' />}>
          <MenuItem href={`/${locale}/pages/user-profile`} icon={<i className='tabler-user-circle' />}>
            {t('sidebar.navigation.userProfile')}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/account-settings`} icon={<i className='tabler-settings' />}>
            {t('sidebar.navigation.accountSettings')}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/faq`} icon={<i className='tabler-help-circle' />}>
            {t('sidebar.navigation.faq')}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/pricing`} icon={<i className='tabler-currency-dollar' />}>
            {t('sidebar.navigation.pricing')}
          </MenuItem>
          <SubMenu label={t('sidebar.navigation.miscellaneous')} icon={<i className='tabler-file-info' />}>
            <MenuItem href={`/${locale}/pages/misc/coming-soon`} target='_blank'>
              {t('sidebar.navigation.comingSoon')}
            </MenuItem>
            <MenuItem href={`/${locale}/pages/misc/under-maintenance`} target='_blank'>
              {t('sidebar.navigation.underMaintenance')}
            </MenuItem>
            <MenuItem href={`/${locale}/pages/misc/404-not-found`} target='_blank'>
              {t('sidebar.navigation.pageNotFound404')}
            </MenuItem>
            <MenuItem href={`/${locale}/pages/misc/401-not-authorized`} target='_blank'>
              {t('sidebar.navigation.notAuthorized401')}
            </MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.authPages')} icon={<i className='tabler-shield-lock' />}>
            <SubMenu label={t('sidebar.navigation.login')}>
              <MenuItem href={`/${locale}/pages/auth/login-v1`} target='_blank'>
                {t('sidebar.navigation.loginV1')}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/login-v2`} target='_blank'>
                {t('sidebar.navigation.loginV2')}
              </MenuItem>
            </SubMenu>
            <SubMenu label={t('sidebar.navigation.register')}>
              <MenuItem href={`/${locale}/pages/auth/register-v1`} target='_blank'>
                {t('sidebar.navigation.registerV1')}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/register-v2`} target='_blank'>
                {t('sidebar.navigation.registerV2')}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/register-multi-steps`} target='_blank'>
                {t('sidebar.navigation.registerMultiSteps')}
              </MenuItem>
            </SubMenu>
            <SubMenu label={t('sidebar.navigation.verifyEmail')}>
              <MenuItem href={`/${locale}/pages/auth/verify-email-v1`} target='_blank'>
                {t('sidebar.navigation.verifyEmailV1')}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/verify-email-v2`} target='_blank'>
                {t('sidebar.navigation.verifyEmailV2')}
              </MenuItem>
            </SubMenu>
            <SubMenu label={t('sidebar.navigation.forgotPassword')}>
              <MenuItem href={`/${locale}/pages/auth/forgot-password-v1`} target='_blank'>
                {t('sidebar.navigation.forgotPasswordV1')}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/forgot-password-v2`} target='_blank'>
                {t('sidebar.navigation.forgotPasswordV2')}
              </MenuItem>
            </SubMenu>
            <SubMenu label={t('sidebar.navigation.resetPassword')}>
              <MenuItem href={`/${locale}/pages/auth/reset-password-v1`} target='_blank'>
                {t('sidebar.navigation.resetPasswordV1')}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/reset-password-v2`} target='_blank'>
                {t('sidebar.navigation.resetPasswordV2')}
              </MenuItem>
            </SubMenu>
            <SubMenu label={t('sidebar.navigation.twoSteps')}>
              <MenuItem href={`/${locale}/pages/auth/two-steps-v1`} target='_blank'>
                {t('sidebar.navigation.twoStepsV1')}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/two-steps-v2`} target='_blank'>
                {t('sidebar.navigation.twoStepsV2')}
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.wizardExamples')} icon={<i className='tabler-dots' />}>
            <MenuItem href={`/${locale}/pages/wizard-examples/checkout`}>{t('sidebar.navigation.checkout')}</MenuItem>
            <MenuItem href={`/${locale}/pages/wizard-examples/property-listing`}>
              {t('sidebar.navigation.propertyListing')}
            </MenuItem>
            <MenuItem href={`/${locale}/pages/wizard-examples/create-deal`}>
              {t('sidebar.navigation.createDeal')}
            </MenuItem>
          </SubMenu>
          <MenuItem href={`/${locale}/pages/dialog-examples`} icon={<i className='tabler-square' />}>
            {t('sidebar.navigation.dialogExamples')}
          </MenuItem>
          <SubMenu label={t('sidebar.navigation.widgetExamples')} icon={<i className='tabler-chart-bar' />}>
            <MenuItem href={`/${locale}/pages/widget-examples/basic`}>{t('sidebar.navigation.basic')}</MenuItem>
            <MenuItem href={`/${locale}/pages/widget-examples/advanced`}>{t('sidebar.navigation.advanced')}</MenuItem>
            <MenuItem href={`/${locale}/pages/widget-examples/statistics`}>
              {t('sidebar.navigation.statistics')}
            </MenuItem>
            <MenuItem href={`/${locale}/pages/widget-examples/charts`}>{t('sidebar.navigation.charts')}</MenuItem>
            <MenuItem href={`/${locale}/pages/widget-examples/actions`}>{t('sidebar.navigation.actions')}</MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.frontPages')} icon={<i className='tabler-files' />}>
            <MenuItem href='/front-pages/landing-page' target='_blank'>
              {t('sidebar.navigation.landing')}
            </MenuItem>
            <MenuItem href='/front-pages/pricing' target='_blank'>
              {t('sidebar.navigation.pricing')}
            </MenuItem>
            <MenuItem href='/front-pages/payment' target='_blank'>
              {t('sidebar.navigation.payment')}
            </MenuItem>
            <MenuItem href='/front-pages/checkout' target='_blank'>
              {t('sidebar.navigation.checkout')}
            </MenuItem>
            <MenuItem href='/front-pages/help-center' target='_blank'>
              {t('sidebar.navigation.helpCenter')}
            </MenuItem>
          </SubMenu>
        </SubMenu>
        <SubMenu label={t('sidebar.navigation.formsAndTables')} icon={<i className='tabler-file-invoice' />}>
          <MenuItem href={`/${locale}/forms/form-layouts`} icon={<i className='tabler-layout' />}>
            {t('sidebar.navigation.formLayouts')}
          </MenuItem>
          <MenuItem href={`/${locale}/forms/form-validation`} icon={<i className='tabler-checkup-list' />}>
            {t('sidebar.navigation.formValidation')}
          </MenuItem>
          <MenuItem href={`/${locale}/forms/form-wizard`} icon={<i className='tabler-git-merge' />}>
            {t('sidebar.navigation.formWizard')}
          </MenuItem>
          <MenuItem href={`/${locale}/react-table`} icon={<i className='tabler-table' />}>
            {t('sidebar.navigation.reactTable')}
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-checkbox' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            {t('sidebar.navigation.formELements')}
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-layout-board-split' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            {t('sidebar.navigation.muiTables')}
          </MenuItem>
        </SubMenu>
        <SubMenu label={t('sidebar.navigation.charts')} icon={<i className='tabler-chart-donut-2' />}>
          <MenuItem href={`/${locale}/charts/apex-charts`} icon={<i className='tabler-chart-ppf' />}>
            {t('sidebar.navigation.apex')}
          </MenuItem>
          <MenuItem href={`/${locale}/charts/recharts`} icon={<i className='tabler-chart-sankey' />}>
            {t('sidebar.navigation.recharts')}
          </MenuItem>
        </SubMenu>
        <SubMenu label={t('sidebar.navigation.others')} icon={<i className='tabler-dots' />}>
          <MenuItem
            icon={<i className='tabler-cards' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/foundation`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            {t('sidebar.navigation.foundation')}
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-atom' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            {t('sidebar.navigation.components')}
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-list-search' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            {t('sidebar.navigation.menuExamples')}
          </MenuItem>
          <MenuItem
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
            href='https://pixinvent.ticksy.com'
            icon={<i className='tabler-lifebuoy' />}
          >
            {t('sidebar.navigation.raiseSupport')}
          </MenuItem>
          <MenuItem
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
            icon={<i className='tabler-book-2' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}`}
          >
            {t('sidebar.navigation.documentation')}
          </MenuItem>
          <MenuItem
            suffix={<CustomChip label='New' size='small' color='info' round='true' />}
            icon={<i className='tabler-notification' />}
          >
            {t('sidebar.navigation.itemWithBadge')}
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-link' />}
            href='https://pixinvent.com'
            target='_blank'
            suffix={<i className='tabler-external-link text-xl' />}
          >
            {t('sidebar.navigation.externalLink')}
          </MenuItem>
          <SubMenu label={t('sidebar.navigation.menuLevels')} icon={<i className='tabler-menu-2' />}>
            <MenuItem>{t('sidebar.navigation.menuLevel2')}</MenuItem>
            <SubMenu label={t('sidebar.navigation.menuLevel2')}>
              <MenuItem>{t('sidebar.navigation.menuLevel3')}</MenuItem>
              <MenuItem>{t('sidebar.navigation.menuLevel3')}</MenuItem>
            </SubMenu>
          </SubMenu>
          <MenuItem disabled>{t('sidebar.navigation.disabledMenu')}</MenuItem>
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
