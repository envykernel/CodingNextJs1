'use client'
import { useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'

import CustomTabList from '@core/components/mui/TabList'
import { useTranslation } from '@/contexts/translationContext'

const VisitRight = ({ tabContentList }: { tabContentList: { [key: string]: React.ReactNode } }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const t = useTranslation()
  const handleChange = (event: React.SyntheticEvent, value: string) => setActiveTab(value)

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab
              icon={<i className='tabler-users' />}
              value='overview'
              label={t.overview || 'Overview'}
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-activity' />}
              value='measurements'
              label={t.patientMeasurements || 'Patient Measurements'}
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-clipboard-text' />}
              value='clinicalExam'
              label={t.clinicalExam || 'Clinical Exam'}
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-prescription' />}
              value='prescriptions'
              label={t.prescriptions || 'Prescriptions'}
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-test-pipe' />}
              value='tests'
              label={t.tests || 'Tests'}
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
  )
}

export default VisitRight
