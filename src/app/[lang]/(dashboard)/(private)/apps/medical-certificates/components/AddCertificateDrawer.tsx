'use client'

import React, { useState, useEffect } from 'react'

import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  Autocomplete
} from '@mui/material'
import type { SelectProps, SelectChangeEvent } from '@mui/material'

import { useSession } from 'next-auth/react'

import { DatePicker } from '@mui/x-date-pickers'

import { format } from 'date-fns'

import { useTranslation } from '@/contexts/translationContext'
import type { CertificateTemplate } from '@/types/certificate'

interface CertificateTemplate {
  id: number
  code: string
  name: string
  description: string
  category: string
  contentTemplate: string
  variablesSchema: any
}

interface Doctor {
  id: number
  name: string
  specialty: string
}

interface Patient {
  id: number
  name: string
  birthdate: string // ISO date string
  gender: string
}

interface AddCertificateDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    patientId: string
    type: string
    startDate: string
    endDate: string
    notes: string
    content: string
  }) => Promise<void>
}

const ITEM_HEIGHT = 48

const MenuProps: Partial<SelectProps['MenuProps']> = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 8.5,
      width: 350
    }
  },
  autoFocus: false
}

export default function AddCertificateDrawer({ open, onClose, onSubmit }: AddCertificateDrawerProps) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [certificateType, setCertificateType] = useState<string>('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [notes, setNotes] = useState('')
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  // Fetch certificate templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/certificates/templates')

        if (!response.ok) throw new Error('Failed to fetch templates')
        const data = await response.json()

        setTemplates(data.templates)
      } catch (err) {
        console.error('Error fetching templates:', err)
        setError('Failed to fetch templates')
      }
    }

    if (open) {
      fetchTemplates()
    }
  }, [open])

  // Fetch patients with search
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/patients')

        if (!response.ok) throw new Error('Failed to fetch patients')
        const data = await response.json()

        console.log('Fetched patients:', data.patients)
        setPatients(data.patients)
      } catch (err) {
        console.error('Error fetching patients:', err)
        setError(t('medicalCertificates.errors.fetchPatientsFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      const timeoutId = setTimeout(() => {
        fetchPatients()
      }, 300) // Debounce search

      return () => clearTimeout(timeoutId)
    }
  }, [open, t])

  // Fetch doctors when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors')

        if (!response.ok) throw new Error('Failed to fetch doctors')
        const data = await response.json()

        setDoctors(data)

        // If current user is a doctor, try to find and select them
        const userName = session?.user?.name

        if (userName) {
          const currentUserDoctor = data.find(
            (doctor: Doctor) => doctor.name.replace(/^Dr\.\s*/i, '') === userName.replace(/^Dr\.\s*/i, '')
          )

          if (currentUserDoctor) {
            setSelectedDoctor(currentUserDoctor)
          }
        }
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError('Failed to fetch doctors')
      }
    }

    if (open) {
      fetchDoctors()
    }
  }, [open, session?.user?.name])

  // Format date for display
  const formatDate = (date: string) => {
    if (!date) return ''

    return new Date(date).toLocaleDateString()
  }

  // Generate preview content based on certificate type and form values
  const getPreviewContent = () => {
    if (!certificateType) return ''

    const selectedTemplate = templates.find(t => t.code === certificateType)

    if (!selectedTemplate?.contentTemplate) {
      console.log('No template content found for:', certificateType)
      console.log('Available templates:', templates)

      return ''
    }

    console.log('Template content:', selectedTemplate.contentTemplate)

    const patientName = selectedPatient?.name || '[Patient Name]'
    const patientGender = selectedPatient?.gender || '[Gender]'
    const formattedStartDate = startDate ? formatDate(format(startDate, 'yyyy-MM-dd')) : '[Start Date]'
    const formattedEndDate = endDate ? formatDate(format(endDate, 'yyyy-MM-dd')) : '[End Date]'

    const formattedBirthdate = selectedPatient?.birthdate
      ? formatDate(new Date(selectedPatient.birthdate).toISOString().split('T')[0])
      : '[Birth Date]'

    const certificateNotes = notes || '[Additional Notes]'

    // Use selected doctor's name or fallback
    const doctorName = selectedDoctor?.name?.replace(/^Dr\.\s*/i, '') || '[Doctor Name]'

    // Get organization name from session user data and convert to uppercase
    const organizationName = session?.user?.organisationName?.toUpperCase() || '[ORGANIZATION NAME]'

    // Get the template content
    let content = selectedTemplate.contentTemplate

    // Replace all template variables
    const replacements: Record<string, string> = {
      '{{patient.name}}': patientName,
      '{{patient.birthdate}}': formattedBirthdate,
      '{{patient.gender}}': patientGender,
      '{{startDate}}': formattedStartDate,
      '{{endDate}}': formattedEndDate,
      '{{notes}}': certificateNotes,
      '{{date}}': new Date().toLocaleDateString(),
      '{{medicalObservation}}': certificateNotes,
      '{{sport}}': '[Sport]',
      '{{restrictions}}': '[Restrictions]',
      '{{duration}}': '[Duration]',
      '{{reason}}': '[Reason]',
      '{{validUntil}}': formattedEndDate,
      '{{profession}}': '[Profession]',
      '{{diagnosis}}': certificateNotes,
      '{{exoneration}}': 'Non',
      '{{school}}': '[School]',
      '{{inaptitude}}': '[Inaptitude]',
      '{{observations}}': certificateNotes,
      '{{ald}}': 'Non',
      '{{deathDate}}': formattedStartDate,
      '{{deathTime}}': '[Time]',
      '{{deathPlace}}': '[Place]',
      '{{apparentCause}}': '[Cause]',
      '{{circumstances}}': '[Circumstances]',
      '{{suspiciousSigns}}': 'Aucun',
      '{{doctor.name}}': doctorName,
      '{{organisation.name}}': organizationName
    }

    // Replace all variables in the template
    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value)
    })

    console.log('Processed content:', content)

    return content
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!selectedPatient) {
      errors.patientId = t('medicalCertificates.errors.required')
    }

    if (!certificateType) {
      errors.type = t('medicalCertificates.errors.required')
    }

    if (!startDate) {
      errors.startDate = t('medicalCertificates.errors.required')
    }

    setFormErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await onSubmit({
        patientId: selectedPatient?.id?.toString() || '',
        type: certificateType,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        notes,
        content: getPreviewContent()
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleClose = () => {
    setSelectedPatient(null)
    setCertificateType('')
    setStartDate(null)
    setEndDate(null)
    setNotes('')
    setError(null)
    onClose()
  }

  // Filter templates based on search
  const filteredTemplates = templates.filter(template => {
    const searchLower = patientSearch.toLowerCase()

    return (
      template.name.toLowerCase().includes(searchLower) ||
      template.description.toLowerCase().includes(searchLower) ||
      template.category.toLowerCase().includes(searchLower)
    )
  })

  // Group filtered templates by category
  const templatesByCategory = filteredTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }

      acc[template.category].push(template)

      return acc
    },
    {} as Record<string, CertificateTemplate[]>
  )

  const handleCertificateTypeChange = (event: SelectChangeEvent<string>) => {
    setCertificateType(event.target.value)
  }

  const handleDoctorChange = (_: React.SyntheticEvent, newValue: Doctor | null) => {
    setSelectedDoctor(newValue)
  }

  const handlePatientChange = (_event: React.SyntheticEvent, newValue: Patient | null) => {
    setSelectedPatient(newValue)
  }

  const handlePatientInputChange = (_: React.SyntheticEvent, value: string) => {
    setPatientSearch(value)
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor='right'
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600 },
          p: 5
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
          <Typography variant='h5'>{t('medicalCertificates.addCertificate')}</Typography>
          <IconButton onClick={handleClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              {error && (
                <Grid item xs={12}>
                  <Alert severity='error' sx={{ mb: 4 }}>
                    {error}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('medicalCertificates.typeLabel')}</InputLabel>
                  <Select
                    value={certificateType}
                    label={t('medicalCertificates.typeLabel')}
                    onChange={handleCertificateTypeChange}
                  >
                    {templates.map(template => (
                      <MenuItem key={template.code} value={template.code}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  value={selectedDoctor}
                  onChange={handleDoctorChange}
                  options={doctors}
                  getOptionLabel={option => `${option.name}${option.specialty ? ` (${option.specialty})` : ''}`}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('medicalCertificates.doctor')}
                      placeholder={t('medicalCertificates.selectDoctor')}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText={t('medicalCertificates.noDoctors')}
                  loading={isLoading}
                  loadingText={t('common.loading')}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  id='patient'
                  options={patients}
                  getOptionLabel={option => option.name}
                  value={selectedPatient}
                  onChange={handlePatientChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('medicalCertificates.patient')}
                      error={Boolean(formErrors.patientId)}
                      helperText={formErrors.patientId}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props

                    return (
                      <li key={option.id} {...otherProps}>
                        <Typography>{option.name}</Typography>
                      </li>
                    )
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('medicalCertificates.startDate')}
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('medicalCertificates.endDate')}
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                  required={certificateType !== 'CERT_MED_SIMPLE'}
                  disabled={certificateType === 'CERT_MED_SIMPLE'}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('medicalCertificates.notes')}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 4, bgcolor: 'background.default' }}>
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    {t('medicalCertificates.preview')}
                  </Typography>
                  <Typography
                    component='div'
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      m: 0,
                      p: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      minHeight: '200px'
                    }}
                  >
                    {getPreviewContent()
                      .split('\\n')
                      .map((line, index, array) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant='outlined' onClick={handleClose}>
                    {t('medicalCertificates.cancel')}
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-check' />}
                  >
                    {t('medicalCertificates.create')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </Drawer>
  )
}
