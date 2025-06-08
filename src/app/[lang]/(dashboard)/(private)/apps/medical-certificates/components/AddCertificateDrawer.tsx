'use client'

import React, { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Autocomplete
} from '@mui/material'
import { format } from 'date-fns'
import CloseIcon from '@mui/icons-material/Close'

import { useTranslation } from '@/contexts/translationContext'

import type { Patient, Doctor, CertificateTemplate } from '@/types/certificate'
import CertificateEditor from './CertificateEditor'

interface AddCertificateDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void // Optional callback for successful creation
}

export default function AddCertificateDrawer({ open, onClose, onSuccess }: AddCertificateDrawerProps) {
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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({})
  const [certificateContent, setCertificateContent] = useState('')

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

  // Update template variables when certificate type changes
  useEffect(() => {
    if (certificateType) {
      const selectedTemplate = templates.find(t => t.code === certificateType)

      if (selectedTemplate?.variablesSchema) {
        // Initialize variables with default values from schema
        const initialVariables: Record<string, any> = {}
        const schema = selectedTemplate.variablesSchema

        if (schema.properties) {
          Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
            initialVariables[key] = prop.default || ''
          })
        }

        setTemplateVariables(initialVariables)
      }
    } else {
      setTemplateVariables({})
    }
  }, [certificateType, templates])

  // Update certificate content when preview content changes
  useEffect(() => {
    setCertificateContent(getPreviewContent())
  }, [certificateType, selectedPatient, selectedDoctor, templateVariables, notes])

  // Handle template variable changes
  const handleTemplateVariableChange = (key: string, value: any) => {
    setTemplateVariables(prev => ({
      ...prev,
      [key]: value
    }))
  }

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

      return ''
    }

    const patientName = selectedPatient?.name || '[Patient Name]'
    const patientGender = selectedPatient?.gender || '[Gender]'

    const formattedBirthdate = selectedPatient?.birthdate
      ? formatDate(new Date(selectedPatient.birthdate).toISOString().split('T')[0])
      : '[Birth Date]'

    const doctorName = selectedDoctor?.name?.replace(/^Dr\.\s*/i, '') || '[Doctor Name]'
    const organizationName = session?.user?.organisationName?.toUpperCase() || '[ORGANIZATION NAME]'

    // Get the template content and replace \n with actual newlines
    let content = selectedTemplate.contentTemplate.replace(/\\n/g, '\n')

    // Base replacements that are always available
    const baseReplacements: Record<string, string> = {
      '{{patient.name}}': patientName,
      '{{patient.birthdate}}': formattedBirthdate,
      '{{patient.gender}}': patientGender,
      '{{doctor.name}}': doctorName,
      '{{organisation.name}}': organizationName,
      '{{date}}': new Date().toLocaleDateString(),
      '{{notes}}': notes || ''
    }

    // Add template-specific variables
    const allReplacements = {
      ...baseReplacements,
      ...Object.entries(templateVariables).reduce(
        (acc, [key, value]) => {
          // Handle date values
          if (value instanceof Date) {
            acc[`{{${key}}}`] = formatDate(value.toISOString().split('T')[0])
          } else if (typeof value === 'boolean') {
            // Handle boolean values (e.g., for exoneration)
            acc[`{{${key}}}`] = value ? 'Oui' : 'Non'
          } else {
            acc[`{{${key}}}`] = String(value || '')
          }

          return acc
        },
        {} as Record<string, string>
      )
    }

    // Replace all variables in the template
    Object.entries(allReplacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value)
    })

    // Convert the content to HTML format
    const htmlContent = content
      .split('\n') // Split by actual newlines
      .map(line => {
        // Handle empty lines
        if (!line.trim()) return '<p><br></p>'

        // Handle signature line
        if (line.includes('___________________________')) {
          return `<p style="text-align: center;">${line}</p>`
        }

        // Regular lines
        return `<p>${line}</p>`
      })
      .join('')

    return htmlContent
  }

  // Render dynamic form fields based on template schema
  const renderTemplateFields = () => {
    const selectedTemplate = templates.find(t => t.code === certificateType)

    if (!selectedTemplate?.variablesSchema?.properties) return null

    const schema = selectedTemplate.variablesSchema
    const fields: JSX.Element[] = []

    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      // Skip fields that are handled separately (like startDate, endDate, notes)
      if (['startDate', 'endDate', 'notes'].includes(key)) return

      let field: JSX.Element

      switch (prop.type) {
        case 'string':
          if (prop.format === 'date') {
            field = (
              <Grid item xs={12} md={6} key={key}>
                <TextField
                  fullWidth
                  type='date'
                  label={prop.description || key}
                  value={templateVariables[key] || ''}
                  onChange={e => handleTemplateVariableChange(key, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required={schema.required?.includes(key)}
                />
              </Grid>
            )
          } else if (prop.enum) {
            field = (
              <Grid item xs={12} md={6} key={key}>
                <FormControl fullWidth>
                  <InputLabel>{prop.description || key}</InputLabel>
                  <Select
                    value={templateVariables[key] || ''}
                    label={prop.description || key}
                    onChange={e => handleTemplateVariableChange(key, e.target.value)}
                    required={schema.required?.includes(key)}
                  >
                    {prop.enum.map((option: string) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )
          } else {
            field = (
              <Grid item xs={12} key={key}>
                <TextField
                  fullWidth
                  multiline={key.includes('description') || key.includes('notes')}
                  rows={key.includes('description') || key.includes('notes') ? 4 : 1}
                  label={prop.description || key}
                  value={templateVariables[key] || ''}
                  onChange={e => handleTemplateVariableChange(key, e.target.value)}
                  required={schema.required?.includes(key)}
                />
              </Grid>
            )
          }

          break

        case 'number':
          field = (
            <Grid item xs={12} md={6} key={key}>
              <TextField
                fullWidth
                type='number'
                label={prop.description || key}
                value={templateVariables[key] || ''}
                onChange={e => handleTemplateVariableChange(key, Number(e.target.value))}
                required={schema.required?.includes(key)}
              />
            </Grid>
          )
          break

        case 'boolean':
          field = (
            <Grid item xs={12} md={6} key={key}>
              <FormControl fullWidth>
                <InputLabel>{prop.description || key}</InputLabel>
                <Select
                  value={templateVariables[key] ? 'oui' : 'non'}
                  label={prop.description || key}
                  onChange={e => handleTemplateVariableChange(key, e.target.value === 'oui')}
                  required={schema.required?.includes(key)}
                >
                  <MenuItem value='oui'>Oui</MenuItem>
                  <MenuItem value='non'>Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )
          break

        default:
          return null
      }

      fields.push(field)
    })

    return fields
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
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: selectedPatient?.id,
          doctorId: selectedDoctor?.id,
          type: certificateType,
          notes,
          content: certificateContent // Use the edited content from the editor
        })
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error || t('Failed to create certificate'))
      }

      // Reset form and close drawer
      setCertificateType('')
      setSelectedPatient(null)
      setSelectedDoctor(null)
      setStartDate(null)
      setEndDate(null)
      setNotes('')
      setTemplateVariables({})
      setCertificateContent('')
      setFormErrors({})

      // Call success callback if provided
      onSuccess?.()

      // Close the drawer
      onClose()
    } catch (err) {
      console.error('Error creating certificate:', err)
      setError(err instanceof Error ? err.message : t('Failed to create certificate'))
    } finally {
      setIsLoading(false)
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

  const handleCertificateTypeChange = (event: any) => {
    setCertificateType(event.target.value)
    setFormErrors({})
  }

  const handleDoctorChange = (_: React.SyntheticEvent, newValue: Doctor | null) => {
    setSelectedDoctor(newValue)
  }

  const handlePatientChange = (event: any, newValue: Patient | null) => {
    setSelectedPatient(newValue)
    setFormErrors({})
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>{t('Add Certificate')}</Typography>
          <IconButton onClick={handleClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              {error && (
                <Grid item xs={12}>
                  <Alert severity='error'>{error}</Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('Certificate Type')}</InputLabel>
                  <Select
                    value={certificateType}
                    label={t('Certificate Type')}
                    onChange={handleCertificateTypeChange}
                    required
                  >
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.code}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={doctors}
                  getOptionLabel={option => option.name || ''}
                  value={selectedDoctor}
                  onChange={handleDoctorChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('Doctor')}
                      required
                      error={!!formErrors.doctorId}
                      helperText={formErrors.doctorId}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={patients}
                  getOptionLabel={option => option.name || ''}
                  value={selectedPatient}
                  onChange={handlePatientChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('Patient')}
                      required
                      error={!!formErrors.patientId}
                      helperText={formErrors.patientId}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('Start Date')}
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={e => {
                    const date = e.target.value ? new Date(e.target.value) : null

                    setStartDate(date)
                    setFormErrors({})
                  }}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!formErrors.startDate}
                  helperText={formErrors.startDate}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('End Date')}
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={e => {
                    const date = e.target.value ? new Date(e.target.value) : null

                    setEndDate(date)
                    setFormErrors({})
                  }}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!formErrors.endDate}
                  helperText={formErrors.endDate}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('Notes')}
                  value={notes}
                  onChange={e => {
                    setNotes(e.target.value)
                    setFormErrors({})
                  }}
                />
              </Grid>

              {/* Render dynamic template fields */}
              {certificateType && renderTemplateFields()}

              <Grid item xs={12}>
                <CertificateEditor
                  content={certificateContent}
                  onChange={setCertificateContent}
                  label={t('Certificate Content')}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant='outlined' onClick={handleClose}>
                    {t('Cancel')}
                  </Button>
                  <Button type='submit' variant='contained' disabled={isLoading}>
                    {isLoading ? t('Creating...') : t('Create Certificate')}
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
