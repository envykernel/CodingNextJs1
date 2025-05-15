'use client'
import { useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import CustomTabList from '@core/components/mui/TabList'
import { useTranslation } from '@/contexts/translationContext'
import VisitStatusControls from './overview/VisitStatusControls'

// Skeleton component only for overview tab
const OverviewSkeleton = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Skeleton variant='text' width='30%' height={40} sx={{ mb: 2 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant='text' width='80%' height={24} />
              <Skeleton variant='text' width='60%' height={24} sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant='text' width='80%' height={24} />
              <Skeleton variant='text' width='60%' height={24} sx={{ mt: 1 }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
)

const VisitRight = ({
  tabContentList,
  visitData,
  dictionary,
  onVisitUpdate
}: {
  tabContentList: { [key: string]: React.ReactNode }
  visitData: any
  dictionary: any
  onVisitUpdate: (updatedVisit: any) => void
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isStatusChanging, setIsStatusChanging] = useState(false)
  const t = useTranslation()

  const handleChange = (event: React.SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const handleStatusChange = (newStatus: string) => {
    // Only show loading state for overview tab when status changes
    if (activeTab === 'overview') {
      setIsStatusChanging(true)

      // Reset the changing state after a short delay
      setTimeout(() => setIsStatusChanging(false), 300)
    }

    console.log('Visit status changed to:', newStatus)
  }

  return (
    <>
      {/* Status Controls - Always visible above tabs */}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <VisitStatusControls
            visitData={visitData}
            onStatusChange={handleStatusChange}
            onVisitUpdate={onVisitUpdate}
            dictionary={dictionary}
          />
        </Grid>
      </Grid>

      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <TabPanel value={activeTab} className='p-0'>
              {activeTab === 'overview' && isStatusChanging ? <OverviewSkeleton /> : tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default VisitRight
