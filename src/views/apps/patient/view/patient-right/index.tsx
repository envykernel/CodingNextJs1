'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'

import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import PrescriptionsTab from './prescriptions'
import OverviewTab from './overview'
import MedicalDataTab from './medical'
import AppointmentsTab from './appointments'
import BillingPlansTab from './billing-plans'
import NotificationsTab from './notifications'
import ConnectionsTab from './connections'

interface TabItem {
  value: string
  label: string
  icon: React.ReactElement
  component: React.ReactElement
}

interface PatientRightProps {
  patientId: number
  patientData: any
  appointments: any[]
}

const PatientRight = ({ patientId, patientData, appointments }: PatientRightProps) => {
  // States
  const [activeTab, setActiveTab] = useState<string>('overview')
  const { t } = useTranslation()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const tabs: TabItem[] = [
    {
      value: 'overview',
      label: t('patientView.tabs.overview') || 'Overview',
      icon: <i className='tabler-user text-xl' />,
      component: <OverviewTab patientData={patientData} />
    },
    {
      value: 'medicalData',
      label: t('patientView.tabs.medicalData') || 'Medical Data',
      icon: <i className='tabler-notes text-xl' />,
      component: <MedicalDataTab patientData={patientData} />
    },
    {
      value: 'appointments',
      label: t('patientView.tabs.appointments') || 'Appointments',
      icon: <i className='tabler-calendar text-xl' />,
      component: <AppointmentsTab appointments={appointments} />
    },
    {
      value: 'prescriptions',
      label: t('patientView.tabs.prescriptions') || 'Prescriptions',
      icon: <LocalPharmacyIcon />,
      component: <PrescriptionsTab patientId={patientId} patientData={patientData} />
    },
    {
      value: 'billingPlans',
      label: t('patientView.tabs.billingPlans') || 'Billing & Plans',
      icon: <i className='tabler-credit-card text-xl' />,
      component: <BillingPlansTab />
    },
    {
      value: 'notifications',
      label: t('patientView.tabs.notifications') || 'Notifications',
      icon: <i className='tabler-bell text-xl' />,
      component: <NotificationsTab />
    },
    {
      value: 'connections',
      label: t('patientView.tabs.connections') || 'Connections',
      icon: <i className='tabler-users text-xl' />,
      component: <ConnectionsTab />
    }
  ]

  return (
    <TabContext value={activeTab}>
      <CustomTabList variant='scrollable' scrollButtons='auto' onChange={handleChange} aria-label='patient view tabs'>
        {tabs.map(tab => (
          <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} iconPosition='start' />
        ))}
      </CustomTabList>
      {tabs.map(tab => (
        <TabPanel key={tab.value} value={tab.value}>
          {tab.component}
        </TabPanel>
      ))}
    </TabContext>
  )
}

export default PatientRight
