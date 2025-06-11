'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tabs from '@mui/material/Tabs'
import Box from '@mui/material/Box'

import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import PrescriptionsTab from './prescriptions'
import OverviewTab from './overview'
import MedicalDataTab from './medical'
import AppointmentsTab from './appointments'
import FinanceTab from './finance'

interface TabItem {
  value: string
  label: string
  icon: React.ReactElement
  component: React.ReactElement
}

interface PatientRightProps {
  patientId: number
  patientData: any
  appointments: Array<{
    id: number
    appointment_date: string
    status: string
    doctor: {
      id: number
      name: string
      specialty: string | null
      email: string | null
      phone_number: string | null
    }
    visit?: {
      id: number
      status: string
    }
  }>
}

const PatientRight = ({ patientId, patientData, appointments }: PatientRightProps) => {
  const [activeTab, setActiveTab] = useState('overview')
  const { t } = useTranslation()

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  const tabs: TabItem[] = [
    {
      value: 'overview',
      label: t('patientView.tabs.overview') || 'Overview',
      icon: <i className='tabler-user text-xl' />,
      component: <OverviewTab patientData={patientData} appointments={appointments} />
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
      value: 'finance',
      label: t('patientView.tabs.finance') || 'Finance',
      icon: <AttachMoneyIcon />,
      component: <FinanceTab patientId={patientId} patientData={patientData} />
    }
  ]

  return (
    <Card>
      <CardContent>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label='patient view tabs'>
          <Tab value='overview' label={t('patientView.tabs.overview')} />
          <Tab value='medical' label={t('patientView.tabs.medical')} />
          <Tab value='prescriptions' label={t('patientView.tabs.prescriptions')} />
          <Tab value='appointments' label={t('patientView.tabs.appointments')} />
        </Tabs>

        <Box sx={{ mt: 4 }}>
          {activeTab === 'overview' && <OverviewTab patientData={patientData} appointments={appointments} />}
          {activeTab === 'medical' && <MedicalDataTab patientData={patientData} />}
          {activeTab === 'prescriptions' && <PrescriptionsTab patientId={patientId} patientData={patientData} />}
          {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} />}
        </Box>
      </CardContent>
    </Card>
  )
}

export default PatientRight
