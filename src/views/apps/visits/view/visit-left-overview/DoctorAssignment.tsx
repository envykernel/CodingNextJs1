'use client'

import { useState, useEffect } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import StethoscopeIcon from '@mui/icons-material/MedicalServices'

import CustomAvatar from '@core/components/mui/Avatar'

import { useTranslation } from '@/contexts/translationContext'
import { updateVisitDoctorAndFetch } from '@/utils/visitActions'

// Doctor type from API response
interface Doctor {
  id: number
  name: string
  email: string | null
  specialty: string | null
  status: string
  organisation_id: number
  phone?: string | null
  phone_number?: string | null
  avatar?: string | null
}

// Doctor type for the visit data
interface VisitDoctor {
  id: number
  name: string
  specialty?: string | null
}

interface DoctorAssignmentProps {
  visitData: {
    id: number
    doctor?: VisitDoctor
  }
  onDoctorUpdate: (updatedVisit: any) => void
}

const DoctorAssignment = ({ visitData, onDoctorUpdate }: DoctorAssignmentProps) => {
  const { t } = useTranslation()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  // Hide success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 2000)

      return () => clearTimeout(timer)
    }
  }, [success])

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true)

        const response = await fetch('/api/doctors')

        if (!response.ok) throw new Error(t('visit.errorFetchingDoctors'))

        const data = await response.json()

        // Filter out disabled doctors
        const activeDoctors = data.filter((doc: Doctor) => doc.status === 'enabled')

        setDoctors(activeDoctors)
      } catch (err) {
        console.error('Error fetching doctors:', err)

        setError(t('visit.errorFetchingDoctors'))
      } finally {
        setLoadingDoctors(false)
      }
    }

    fetchDoctors()
  }, [t])

  const handleDoctorChange = async (_: any, newDoctor: Doctor | null) => {
    if (!newDoctor) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const fullVisit = await updateVisitDoctorAndFetch(visitData.id, newDoctor.id)

      onDoctorUpdate(fullVisit)
      setSuccess(t('visit.doctorUpdateSuccess'))
      setEditMode(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Convert VisitDoctor to Doctor for Autocomplete
  const currentDoctor = visitData.doctor ? doctors.find(d => d.id === visitData.doctor?.id) || null : null

  return (
    <Card className='mb-6'>
      <CardContent>
        <Typography variant='h6' className='mb-4'>
          {t('visit.assignedDoctor')}
        </Typography>

        {/* Doctor Card or Warning */}
        {currentDoctor ? (
          <Box display='flex' alignItems='center' gap={2} mb={2}>
            <CustomAvatar
              alt={currentDoctor.name}
              variant='rounded'
              size={56}
              sx={{ minWidth: 56, minHeight: 56, fontSize: 24, bgcolor: 'success.main' }}
            >
              <StethoscopeIcon fontSize='medium' sx={{ color: 'white' }} />
            </CustomAvatar>
            <Box flex='1'>
              <Typography variant='subtitle1' fontWeight='bold'>
                {currentDoctor.name}
              </Typography>
              {currentDoctor.specialty && (
                <Typography variant='body2' color='text.secondary' mt={1}>
                  {currentDoctor.specialty}
                </Typography>
              )}
            </Box>
            <IconButton
              aria-label={t('visit.selectDoctor')}
              onClick={() => setEditMode(v => !v)}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: '50%',
                p: 1,
                transition: 'background 0.2s',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              <EditIcon />
            </IconButton>
          </Box>
        ) : (
          <Box display='flex' alignItems='center' gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
              <WarningAmberIcon />
            </Avatar>
            <Box flex='1'>
              <Typography variant='subtitle1' color='warning.main' fontWeight='bold'>
                {t('visit.noDoctorAssigned')}
              </Typography>
            </Box>
            <IconButton
              aria-label={t('visit.selectDoctor')}
              onClick={() => setEditMode(v => !v)}
              color='warning'
              sx={{
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: '50%',
                p: 1,
                transition: 'background 0.2s',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              <PersonOffIcon />
            </IconButton>
          </Box>
        )}

        {/* Inline Autocomplete for Changing Doctor */}
        <Collapse in={editMode}>
          <Box mt={2} mb={2}>
            <Autocomplete
              options={doctors}
              getOptionLabel={option => `${option.name}${option.specialty ? ` (${option.specialty})` : ''}`}
              value={currentDoctor}
              onChange={handleDoctorChange}
              loading={loading || loadingDoctors}
              disabled={loading || loadingDoctors}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('visit.selectDoctor')}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading || loadingDoctors ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props

                return (
                  <li key={key} {...otherProps}>
                    <Box>
                      <Typography variant='body1'>{option.name}</Typography>
                      {option.specialty && (
                        <Typography variant='caption' color='text.secondary'>
                          {option.specialty}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )
              }}
            />
          </Box>
        </Collapse>

        {error && (
          <Alert severity='error' className='mt-4'>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' className='mt-4'>
            {success}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default DoctorAssignment
