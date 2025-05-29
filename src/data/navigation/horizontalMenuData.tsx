// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import { useTranslation } from '@/contexts/translationContext'

const horizontalMenuData = (): HorizontalMenuDataType[] => {
  const { t } = useTranslation()

  return [
    // This is how you will normally render submenu
    {
      label: t('sidebar.navigation.dashboards'),
      icon: 'tabler-smart-home',
      children: [
        // This is how you will normally render menu item
        {
          label: t('sidebar.navigation.crm'),
          icon: 'tabler-chart-pie-2',
          href: '/dashboards/crm'
        },
        {
          label: t('sidebar.navigation.analytics'),
          icon: 'tabler-trending-up',
          href: '/dashboards/analytics'
        },
        {
          label: t('sidebar.navigation.eCommerce'),
          icon: 'tabler-shopping-cart',
          href: '/dashboards/ecommerce'
        },
        {
          label: t('sidebar.navigation.academy'),
          icon: 'tabler-school',
          href: '/dashboards/academy'
        },
        {
          label: t('sidebar.navigation.logistics'),
          icon: 'tabler-truck',
          href: '/dashboards/logistics'
        },
        {
          label: t('sidebar.navigation.organization'),
          icon: 'tabler-building',
          href: '/dashboards/organization'
        }
      ]
    },
    {
      label: t('sidebar.navigation.apps'),
      icon: 'tabler-mail',
      children: [
        {
          label: t('sidebar.navigation.eCommerce'),
          icon: 'tabler-shopping-cart',
          children: [
            {
              label: t('sidebar.navigation.dashboard'),
              href: '/apps/ecommerce/dashboard'
            },
            {
              label: t('sidebar.navigation.products'),
              children: [
                {
                  label: t('sidebar.navigation.list'),
                  href: '/apps/ecommerce/products/list'
                },
                {
                  label: t('sidebar.navigation.add'),
                  href: '/apps/ecommerce/products/add'
                },
                {
                  label: t('sidebar.navigation.category'),
                  href: '/apps/ecommerce/products/category'
                }
              ]
            },
            {
              label: t('sidebar.navigation.orders'),
              children: [
                {
                  label: t('sidebar.navigation.list'),
                  href: '/apps/ecommerce/orders/list'
                },
                {
                  label: t('sidebar.navigation.details'),
                  href: '/apps/ecommerce/orders/details/5434',
                  exactMatch: false,
                  activeUrl: '/apps/ecommerce/orders/details'
                }
              ]
            },
            {
              label: t('sidebar.navigation.customers'),
              children: [
                {
                  label: t('sidebar.navigation.list'),
                  href: '/apps/ecommerce/customers/list'
                },
                {
                  label: t('sidebar.navigation.details'),
                  href: '/apps/ecommerce/customers/details/879861',
                  exactMatch: false,
                  activeUrl: '/apps/ecommerce/customers/details'
                }
              ]
            },
            {
              label: t('sidebar.navigation.manageReviews'),
              href: '/apps/ecommerce/manage-reviews'
            },
            {
              label: t('sidebar.navigation.referrals'),
              href: '/apps/ecommerce/referrals'
            },
            {
              label: t('sidebar.navigation.settings'),
              href: '/apps/ecommerce/settings'
            }
          ]
        },
        {
          label: t('sidebar.navigation.academy'),
          icon: 'tabler-school',
          children: [
            {
              label: t('sidebar.navigation.dashboard'),
              href: '/apps/academy/dashboard'
            },
            {
              label: t('sidebar.navigation.myCourses'),
              href: '/apps/academy/my-courses'
            },
            {
              label: t('sidebar.navigation.courseDetails'),
              href: '/apps/academy/course-details'
            }
          ]
        },
        {
          label: t('sidebar.navigation.logistics'),
          icon: 'tabler-truck',
          children: [
            {
              label: t('sidebar.navigation.dashboard'),
              href: '/apps/logistics/dashboard'
            },
            {
              label: t('sidebar.navigation.fleet'),
              href: '/apps/logistics/fleet'
            }
          ]
        },
        {
          label: t('sidebar.navigation.email'),
          icon: 'tabler-mail',
          href: '/apps/email',
          exactMatch: false,
          activeUrl: '/apps/email'
        },
        {
          label: t('sidebar.navigation.chat'),
          icon: 'tabler-message-circle-2',
          href: '/apps/chat'
        },
        {
          label: t('sidebar.navigation.calendar'),
          icon: 'tabler-calendar',
          href: '/apps/calendar'
        },
        {
          label: t('sidebar.navigation.kanban'),
          icon: 'tabler-copy',
          href: '/apps/kanban'
        },
        {
          label: t('sidebar.navigation.invoice'),
          icon: 'tabler-file-description',
          children: [
            {
              label: t('sidebar.navigation.list'),
              icon: 'tabler-circle',
              href: '/apps/invoice/list'
            },
            {
              label: t('sidebar.navigation.preview'),
              icon: 'tabler-circle',
              href: '/apps/invoice/preview/4987',
              exactMatch: false,
              activeUrl: '/apps/invoice/preview'
            },
            {
              label: t('sidebar.navigation.edit'),
              icon: 'tabler-circle',
              href: '/apps/invoice/edit/4987',
              exactMatch: false,
              activeUrl: '/apps/invoice/edit'
            },
            {
              label: t('sidebar.navigation.add'),
              icon: 'tabler-circle',
              href: '/apps/invoice/add'
            }
          ]
        },
        {
          label: t('sidebar.navigation.user'),
          icon: 'tabler-user',
          children: [
            {
              label: t('sidebar.navigation.list'),
              icon: 'tabler-circle',
              href: '/apps/user/list'
            },
            {
              label: t('sidebar.navigation.view'),
              icon: 'tabler-circle',
              href: '/apps/user/view'
            }
          ]
        },
        {
          label: t('sidebar.navigation.rolesPermissions'),
          icon: 'tabler-lock',
          children: [
            {
              label: t('sidebar.navigation.roles'),
              icon: 'tabler-circle',
              href: '/apps/roles'
            },
            {
              label: t('sidebar.navigation.permissions'),
              icon: 'tabler-circle',
              href: '/apps/permissions'
            }
          ]
        },
        {
          label: 'Prescriptions',
          icon: 'tabler-prescription',
          children: [
            {
              label: 'All Prescriptions',
              href: '/apps/prescriptions/list'
            },
            {
              label: 'Create Prescription',
              href: '/apps/prescriptions/create'
            }
          ]
        },
        {
          label: t('sidebar.navigation.patients'),
          icon: 'tabler-users',
          children: [
            {
              label: t('sidebar.navigation.list'),
              href: '/apps/patient/list'
            }
          ]
        },
        {
          label: t('sidebar.navigation.appointments'),
          icon: 'tabler-calendar-event',
          children: [
            {
              label: t('sidebar.navigation.appointmentsList'),
              icon: 'tabler-list',
              href: '/apps/appointments/list'
            }
          ]
        }
      ]
    },
    {
      label: t('sidebar.navigation.pages'),
      icon: 'tabler-file',
      children: [
        {
          label: t('sidebar.navigation.userProfile'),
          icon: 'tabler-user-circle',
          href: '/pages/user-profile'
        },
        {
          label: t('sidebar.navigation.accountSettings'),
          icon: 'tabler-settings',
          href: '/pages/account-settings'
        },
        {
          label: t('sidebar.navigation.faq'),
          icon: 'tabler-help-circle',
          href: '/pages/faq'
        },
        {
          label: t('sidebar.navigation.pricing'),
          icon: 'tabler-currency-dollar',
          href: '/pages/pricing'
        },
        {
          label: t('sidebar.navigation.miscellaneous'),
          icon: 'tabler-file-info',
          children: [
            {
              label: t('sidebar.navigation.comingSoon'),
              icon: 'tabler-circle',
              href: '/pages/misc/coming-soon',
              target: '_blank'
            },
            {
              label: t('sidebar.navigation.underMaintenance'),
              icon: 'tabler-circle',
              href: '/pages/misc/under-maintenance',
              target: '_blank'
            },
            {
              label: t('sidebar.navigation.pageNotFound404'),
              icon: 'tabler-circle',
              href: '/pages/misc/404-not-found',
              target: '_blank'
            },
            {
              label: t('sidebar.navigation.notAuthorized401'),
              icon: 'tabler-circle',
              href: '/pages/misc/401-not-authorized',
              target: '_blank'
            }
          ]
        },
        {
          label: t('sidebar.navigation.authPages'),
          icon: 'tabler-shield-lock',
          children: [
            {
              label: t('sidebar.navigation.login'),
              icon: 'tabler-circle',
              children: [
                {
                  label: t('sidebar.navigation.loginV1'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/login-v1',
                  target: '_blank'
                },
                {
                  label: t('sidebar.navigation.loginV2'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/login-v2',
                  target: '_blank'
                }
              ]
            },
            {
              label: t('sidebar.navigation.register'),
              icon: 'tabler-circle',
              children: [
                {
                  label: t('sidebar.navigation.registerV1'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/register-v1',
                  target: '_blank'
                },
                {
                  label: t('sidebar.navigation.registerV2'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/register-v2',
                  target: '_blank'
                },
                {
                  label: t('sidebar.navigation.registerMultiSteps'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/register-multi-steps',
                  target: '_blank'
                }
              ]
            },
            {
              label: t('sidebar.navigation.verifyEmail'),
              icon: 'tabler-circle',
              children: [
                {
                  label: t('sidebar.navigation.verifyEmailV1'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/verify-email-v1',
                  target: '_blank'
                },
                {
                  label: t('sidebar.navigation.verifyEmailV2'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/verify-email-v2',
                  target: '_blank'
                }
              ]
            },
            {
              label: t('sidebar.navigation.forgotPassword'),
              icon: 'tabler-circle',
              children: [
                {
                  label: t('sidebar.navigation.forgotPasswordV1'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/forgot-password-v1',
                  target: '_blank'
                },
                {
                  label: t('sidebar.navigation.forgotPasswordV2'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/forgot-password-v2',
                  target: '_blank'
                }
              ]
            },
            {
              label: t('sidebar.navigation.resetPassword'),
              icon: 'tabler-circle',
              children: [
                {
                  label: t('sidebar.navigation.resetPasswordV1'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/reset-password-v1',
                  target: '_blank'
                },
                {
                  label: t('sidebar.navigation.resetPasswordV2'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/reset-password-v2',
                  target: '_blank'
                }
              ]
            },
            {
              label: t('sidebar.navigation.twoSteps'),
              icon: 'tabler-circle',
              children: [
                {
                  label: t('sidebar.navigation.twoStepsV1'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/two-steps-v1',
                  target: '_blank'
                },
                {
                  label: t('sidebar.navigation.twoStepsV2'),
                  icon: 'tabler-circle',
                  href: '/pages/auth/two-steps-v2',
                  target: '_blank'
                }
              ]
            }
          ]
        },
        {
          label: t('sidebar.navigation.wizardExamples'),
          icon: 'tabler-dots',
          children: [
            {
              label: t('sidebar.navigation.checkout'),
              icon: 'tabler-circle',
              href: '/pages/wizard-examples/checkout'
            },
            {
              label: t('sidebar.navigation.propertyListing'),
              icon: 'tabler-circle',
              href: '/pages/wizard-examples/property-listing'
            },
            {
              label: t('sidebar.navigation.createDeal'),
              icon: 'tabler-circle',
              href: '/pages/wizard-examples/create-deal'
            }
          ]
        },
        {
          label: t('sidebar.navigation.dialogExamples'),
          icon: 'tabler-square',
          href: '/pages/dialog-examples'
        },
        {
          label: t('sidebar.navigation.widgetExamples'),
          icon: 'tabler-chart-bar',
          children: [
            {
              label: t('sidebar.navigation.basic'),
              href: '/pages/widget-examples/basic'
            },
            {
              label: t('sidebar.navigation.advanced'),
              icon: 'tabler-circle',
              href: '/pages/widget-examples/advanced'
            },
            {
              label: t('sidebar.navigation.statistics'),
              icon: 'tabler-circle',
              href: '/pages/widget-examples/statistics'
            },
            {
              label: t('sidebar.navigation.charts'),
              icon: 'tabler-circle',
              href: '/pages/widget-examples/charts'
            },
            {
              label: t('sidebar.navigation.actions'),
              href: '/pages/widget-examples/actions'
            }
          ]
        },
        {
          label: t('sidebar.navigation.frontPages'),
          icon: 'tabler-files',
          children: [
            {
              label: t('sidebar.navigation.landing'),
              href: '/front-pages/landing-page',
              target: '_blank',
              excludeLang: true
            },
            {
              label: t('sidebar.navigation.pricing'),
              href: '/front-pages/pricing',
              target: '_blank',
              excludeLang: true
            },
            {
              label: t('sidebar.navigation.payment'),
              href: '/front-pages/payment',
              target: '_blank',
              excludeLang: true
            },
            {
              label: t('sidebar.navigation.checkout'),
              href: '/front-pages/checkout',
              target: '_blank',
              excludeLang: true
            },
            {
              label: t('sidebar.navigation.helpCenter'),
              href: '/front-pages/help-center',
              target: '_blank',
              excludeLang: true
            }
          ]
        }
      ]
    },
    {
      label: t('sidebar.navigation.formsAndTables'),
      icon: 'tabler-file-invoice',
      children: [
        {
          label: t('sidebar.navigation.formLayouts'),
          icon: 'tabler-layout',
          href: '/forms/form-layouts'
        },
        {
          label: t('sidebar.navigation.formValidation'),
          icon: 'tabler-checkup-list',
          href: '/forms/form-validation'
        },
        {
          label: t('sidebar.navigation.formWizard'),
          icon: 'tabler-git-merge',
          href: '/forms/form-wizard'
        },
        {
          label: t('sidebar.navigation.reactTable'),
          icon: 'tabler-table',
          href: '/react-table'
        },
        {
          label: t('sidebar.navigation.formELements'),
          icon: 'tabler-checkbox',
          suffix: <i className='tabler-external-link text-xl' />,
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`,
          target: '_blank'
        },
        {
          label: t('sidebar.navigation.muiTables'),
          icon: 'tabler-layout-board-split',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`,
          suffix: <i className='tabler-external-link text-xl' />,
          target: '_blank'
        }
      ]
    },
    {
      label: t('sidebar.navigation.charts'),
      icon: 'tabler-chart-donut-2',
      children: [
        {
          label: t('sidebar.navigation.apex'),
          icon: 'tabler-chart-ppf',
          href: '/charts/apex-charts'
        },
        {
          label: t('sidebar.navigation.recharts'),
          icon: 'tabler-chart-sankey',
          href: '/charts/recharts'
        }
      ]
    },
    {
      label: t('sidebar.navigation.others'),
      icon: 'tabler-dots',
      children: [
        {
          label: t('sidebar.navigation.foundation'),
          icon: 'tabler-cards',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/foundation`,
          suffix: <i className='tabler-external-link text-xl' />,
          target: '_blank'
        },
        {
          label: t('sidebar.navigation.components'),
          icon: 'tabler-atom',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`,
          suffix: <i className='tabler-external-link text-xl' />,
          target: '_blank'
        },
        {
          label: t('sidebar.navigation.menuExamples'),
          icon: 'tabler-list-search',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`,
          suffix: <i className='tabler-external-link text-xl' />,
          target: '_blank'
        },
        {
          label: t('sidebar.navigation.raiseSupport'),
          icon: 'tabler-lifebuoy',
          suffix: <i className='tabler-external-link text-xl' />,
          target: '_blank',
          href: 'https://pixinvent.ticksy.com'
        },
        {
          label: t('sidebar.navigation.documentation'),
          icon: 'tabler-book-2',
          suffix: <i className='tabler-external-link text-xl' />,
          target: '_blank',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}`
        },
        {
          suffix: {
            label: 'New',
            color: 'info'
          },
          label: t('sidebar.navigation.itemWithBadge'),
          icon: 'tabler-notification'
        },
        {
          label: t('sidebar.navigation.externalLink'),
          icon: 'tabler-link',
          href: 'https://pixinvent.com',
          target: '_blank',
          suffix: <i className='tabler-external-link text-xl' />
        },
        {
          label: t('sidebar.navigation.menuLevels'),
          icon: 'tabler-menu-2',
          children: [
            {
              label: t('sidebar.navigation.menuLevel2'),
              icon: 'tabler-circle'
            },
            {
              label: t('sidebar.navigation.menuLevel2'),
              icon: 'tabler-circle',
              children: [
                {
                  label: t('sidebar.navigation.menuLevel3'),
                  icon: 'tabler-circle'
                },
                {
                  label: t('sidebar.navigation.menuLevel3'),
                  icon: 'tabler-circle'
                }
              ]
            }
          ]
        },
        {
          label: t('sidebar.navigation.disabledMenu'),
          disabled: true
        }
      ]
    }
  ]
}

export default horizontalMenuData
