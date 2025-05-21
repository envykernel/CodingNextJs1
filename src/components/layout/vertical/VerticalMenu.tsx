// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'
import { useTranslation } from '@/contexts/translationContext'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { t } = useTranslation()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const locale = (params?.lang as string) || 'en'

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <SubMenu
          label={t('sidebar.navigation.dashboards')}
          icon={<i className='tabler-smart-home' />}
          suffix={<CustomChip label='6' size='small' color='error' round='true' />}
        >
          <MenuItem href={`/${locale}/dashboards/crm`}>{t('sidebar.navigation.crm')}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/analytics`}>{t('sidebar.navigation.analytics')}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/ecommerce`}>{t('sidebar.navigation.eCommerce')}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/academy`}>{t('sidebar.navigation.academy')}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/logistics`}>{t('sidebar.navigation.logistics')}</MenuItem>
          <MenuItem href={`/${locale}/dashboards/organization`} icon={<i className='tabler-building' />}>
            {t('sidebar.navigation.organization')}
          </MenuItem>
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
        <MenuSection label={t('sidebar.navigation.appsPages')}>
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
          <SubMenu label={t('sidebar.navigation.patients')} icon={<i className='tabler-users' />}>
            <MenuItem href={`/${locale}/apps/patient/list`}>{t('sidebar.navigation.list')}</MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.appointments')} icon={<i className='tabler-calendar-event' />}>
            <MenuItem href={`/${locale}/apps/appointments/list`} icon={<i className='tabler-list' />}>
              {t('sidebar.navigation.appointmentsList')}
            </MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.prescriptions')} icon={<i className='tabler-prescription' />}>
            <MenuItem href={`/${locale}/apps/prescriptions/list`}>{t('sidebar.navigation.allPrescriptions')}</MenuItem>
            <MenuItem href={`/${locale}/apps/prescriptions/create`}>
              {t('sidebar.navigation.createPrescription')}
            </MenuItem>
          </SubMenu>
          <SubMenu label={t('sidebar.navigation.pages')} icon={<i className='tabler-file' />}>
            <MenuItem href={`/${locale}/pages/user-profile`}>{t('sidebar.navigation.userProfile')}</MenuItem>
            <MenuItem href={`/${locale}/pages/account-settings`}>{t('sidebar.navigation.accountSettings')}</MenuItem>
            <MenuItem href={`/${locale}/pages/faq`}>{t('sidebar.navigation.faq')}</MenuItem>
            <MenuItem href={`/${locale}/pages/pricing`}>{t('sidebar.navigation.pricing')}</MenuItem>
            <SubMenu label={t('sidebar.navigation.miscellaneous')}>
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
        </MenuSection>
        <MenuSection label={t('sidebar.navigation.formsAndTables')}>
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
        </MenuSection>
        <MenuSection label={t('sidebar.navigation.chartsMisc')}>
          <SubMenu label={t('sidebar.navigation.charts')} icon={<i className='tabler-chart-donut-2' />}>
            <MenuItem href={`/${locale}/charts/apex-charts`}>{t('sidebar.navigation.apex')}</MenuItem>
            <MenuItem href={`/${locale}/charts/recharts`}>{t('sidebar.navigation.recharts')}</MenuItem>
          </SubMenu>
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
            icon={<i className='tabler-lifebuoy' />}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
            href='https://pixinvent.ticksy.com'
          >
            {t('sidebar.navigation.raiseSupport')}
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-book-2' />}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}`}
          >
            {t('sidebar.navigation.documentation')}
          </MenuItem>
          <SubMenu label={t('sidebar.navigation.others')} icon={<i className='tabler-box' />}>
            <MenuItem suffix={<CustomChip label='New' size='small' color='info' round='true' />}>
              {t('sidebar.navigation.itemWithBadge')}
            </MenuItem>
            <MenuItem
              href='https://pixinvent.com'
              target='_blank'
              suffix={<i className='tabler-external-link text-xl' />}
            >
              {t('sidebar.navigation.externalLink')}
            </MenuItem>
            <MenuItem disabled>{t('sidebar.navigation.disabledMenu')}</MenuItem>
          </SubMenu>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
