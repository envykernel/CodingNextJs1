'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent } from 'react'

// MUI Imports
import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Type Imports
import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'

// Hook Imports
import { useTranslation } from '@/contexts/translationContext'

// Dynamic Imports
const SettingsTab = dynamic(() => import('./SettingsTab'))

const UserProfile = ({ data }: { data?: Data }) => {
  // States
  const [activeTab, setActiveTab] = useState('settings')
  const { t } = useTranslation()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserProfileHeader data={data?.profileHeader} />
      </Grid>
      <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
        <TabContext value={activeTab}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-settings text-lg' />
                  {t('userProfile.settings')}
                </div>
              }
              value='settings'
            />
          </CustomTabList>
          <TabPanel value={activeTab} className='p-0'>
            <SettingsTab />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}

export default UserProfile
