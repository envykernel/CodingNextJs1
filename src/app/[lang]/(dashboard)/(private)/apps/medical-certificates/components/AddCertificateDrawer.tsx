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
  Paper
} from '@mui/material'

import { useTranslation } from '@/contexts/translationContext'

interface Patient {
  id: number
  name: string
  birthdate: string | null
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
  }) => Promise<void>
}

const AddCertificateDrawer = ({ open, onClose, onSubmit }: AddCertificateDrawerProps) => {
  const { t } = useTranslation()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [certificateType, setCertificateType] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients')

        if (!response.ok) throw new Error('Failed to fetch patients')
        const data = await response.json()

        console.log('Raw API response:', data)

        // The API returns { patients: Patient[] }
        const patientsArray = data.patients || []

        console.log(
          'Processed patients array:',
          patientsArray.map((p: Patient) => ({
            id: p.id,
            name: p.name,
            gender: p.gender
          }))
        )
        setPatients(patientsArray)
      } catch (err) {
        console.error('Error fetching patients:', err)
        setError(t('medicalCertificates.errors.fetchPatientsFailed'))
      }
    }

    if (open) {
      fetchPatients()
    }
  }, [open, t])

  // Get the selected patient's details for the preview
  const selectedPatientDetails = patients.find(p => p.id.toString() === selectedPatient)

  console.log('Selected patient details:', {
    selectedPatient,
    selectedPatientDetails,
    allPatients: patients
  })

  // Format date for display
  const formatDate = (date: string) => {
    if (!date) return ''

    return new Date(date).toLocaleDateString()
  }

  // Generate preview content based on certificate type and form values
  const getPreviewContent = () => {
    if (!certificateType) return ''

    const patientName = selectedPatientDetails?.name || '[Patient Name]'
    const rawGender = selectedPatientDetails?.gender

    console.log('Debug gender:', {
      rawGender,
      selectedPatientDetails,
      hasGender: !!selectedPatientDetails?.gender
    })

    // Translate the gender value using the patient gender options
    let patientGender = '[Gender]'

    if (rawGender) {
      const genderKey = `patient.gender.options.${rawGender.toLowerCase()}`

      console.log('Gender translation key:', genderKey)
      patientGender = t(genderKey)
    }

    const formattedStartDate = startDate ? formatDate(startDate) : '[Start Date]'
    const formattedEndDate = endDate ? formatDate(endDate) : '[End Date]'
    const certificateNotes = notes || '[Additional Notes]'

    const templates: Record<string, string> = {
      sick_leave: `
CERTIFICAT MÉDICAL

Je soussigné(e), médecin, certifie que ${patientName} (${patientGender}) a été examiné(e) dans mon cabinet.

Diagnostic: ${certificateNotes}

Durée de l'arrêt de travail: Du ${formattedStartDate} au ${formattedEndDate}.

Ce certificat est établi à la demande de l'intéressé(e) pour servir et valoir ce que de droit.

Date: ${new Date().toLocaleDateString()}
Signature du médecin: _________________
      `,
      fitness: `
CERTIFICAT DE NON CONTRE-INDICATION

Je soussigné(e), médecin, certifie que ${patientName} (${patientGender}) a été examiné(e) dans mon cabinet.

Après examen clinique complet, je certifie qu'il/elle ne présente aucune contre-indication à la pratique d'une activité physique.

Validité: Du ${formattedStartDate} au ${formattedEndDate}.

Observations: ${certificateNotes}

Ce certificat est établi à la demande de l'intéressé(e) pour servir et valoir ce que de droit.

Date: ${new Date().toLocaleDateString()}
Signature du médecin: _________________
      `,
      consultation: `
CERTIFICAT DE CONSULTATION

Je soussigné(e), médecin, certifie que ${patientName} (${patientGender}) a consulté dans mon cabinet le ${formattedStartDate}.

Motif de la consultation: ${certificateNotes}

Ce certificat est établi à la demande de l'intéressé(e) pour servir et valoir ce que de droit.

Date: ${new Date().toLocaleDateString()}
Signature du médecin: _________________
      `
    }

    return templates[certificateType] || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await onSubmit({
        patientId: selectedPatient,
        type: certificateType,
        startDate,
        endDate,
        notes
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedPatient('')
    setCertificateType('')
    setStartDate('')
    setEndDate('')
    setNotes('')
    setError(null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor='right'
      PaperProps={{
        sx: { width: { xs: '100%', sm: 720 } }
      }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
          <Typography variant='h5'>{t('medicalCertificates.addCertificate')}</Typography>
          <Button variant='outlined' onClick={handleClose}>
            {t('medicalCertificates.cancel')}
          </Button>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('medicalCertificates.patient')}</InputLabel>
                <Select
                  value={selectedPatient}
                  label={t('medicalCertificates.patient')}
                  onChange={e => {
                    console.log('Patient selection changed:', e.target.value)
                    setSelectedPatient(e.target.value)
                  }}
                  required
                >
                  {patients && patients.length > 0 ? (
                    patients.map(patient => {
                      console.log('Rendering patient option:', patient)

                      return (
                        <MenuItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </MenuItem>
                      )
                    })
                  ) : (
                    <MenuItem disabled>{t('medicalCertificates.noPatients')}</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('medicalCertificates.certificateType')}</InputLabel>
                <Select
                  value={certificateType}
                  label={t('medicalCertificates.certificateType')}
                  onChange={e => setCertificateType(e.target.value)}
                  required
                >
                  <MenuItem value='sick_leave'>{t('medicalCertificates.types.sickLeave')}</MenuItem>
                  <MenuItem value='fitness'>{t('medicalCertificates.types.fitness')}</MenuItem>
                  <MenuItem value='consultation'>{t('medicalCertificates.types.medicalReport')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type='date'
                label={t('medicalCertificates.startDate')}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type='date'
                label={t('medicalCertificates.endDate')}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required={certificateType !== 'consultation'}
                disabled={certificateType === 'consultation'}
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

            {/* Preview Section */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {t('medicalCertificates.preview')}
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  minHeight: '300px'
                }}
              >
                {getPreviewContent()}
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
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {t('medicalCertificates.create')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddCertificateDrawer
