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

const UserRight = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  // States
  const [activeTab, setActiveTab] = useState('overview')
  const { t } = useTranslation()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                icon={<i className='tabler-users' />}
                value='overview'
                label={t('navigation.overview') || t('navigation.dashboard') || 'Overview'}
                iconPosition='start'
              />
              <Tab
                icon={<i className='tabler-heartbeat' />}
                value='medical'
                label={t('patient.medicalData') || 'Medical Data'}
                iconPosition='start'
              />
              <Tab
                icon={<i className='tabler-calendar-event' />}
                value='appointments'
                label={t('appointmentsList') || 'Appointments'}
                iconPosition='start'
              />
              <Tab
                icon={<i className='tabler-lock' />}
                value='security'
                label={t('navigation.security') || 'Security'}
                iconPosition='start'
              />
              <Tab
                icon={<i className='tabler-bookmark' />}
                value='billing-plans'
                label={t('navigation.billingPlans') || 'Billing & Plans'}
                iconPosition='start'
              />
              <Tab
                icon={<i className='tabler-bell' />}
                value='notifications'
                label={t('navigation.notifications') || 'Notifications'}
                iconPosition='start'
              />
              <Tab
                icon={<i className='tabler-link' />}
                value='connections'
                label={t('navigation.connections') || 'Connections'}
                iconPosition='start'
              />
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
