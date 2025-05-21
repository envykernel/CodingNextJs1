'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'

import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

interface TabItem {
  value: string
  label: string
  icon: React.ReactElement
}

const UserRight = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  // States
  const [activeTab, setActiveTab] = useState('overview')
  const { t } = useTranslation()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const tabs: TabItem[] = [
    {
      value: 'overview',
      label: t('patientView.tabs.overview') || 'Overview',
      icon: <i className='tabler-users' />
    },
    {
      value: 'medical-data',
      label: t('patientView.tabs.medicalData') || 'Medical Data',
      icon: <i className='tabler-heartbeat' />
    },
    {
      value: 'appointments',
      label: t('patientView.tabs.appointments') || 'Appointments',
      icon: <i className='tabler-calendar-event' />
    },
    {
      value: 'security',
      label: t('patientView.tabs.security') || 'Security',
      icon: <i className='tabler-lock' />
    },
    {
      value: 'billing-plans',
      label: t('patientView.tabs.billingPlans') || 'Billing & Plans',
      icon: <i className='tabler-bookmark' />
    },
    {
      value: 'notifications',
      label: t('patientView.tabs.notifications') || 'Notifications',
      icon: <i className='tabler-bell' />
    },
    {
      value: 'connections',
      label: t('patientView.tabs.connections') || 'Connections',
      icon: <i className='tabler-link' />
    }
  ]

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              {tabs.map((tab: TabItem) => (
                <Tab key={tab.value} icon={tab.icon} value={tab.value} label={tab.label} iconPosition='start' />
              ))}
            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default UserRight
