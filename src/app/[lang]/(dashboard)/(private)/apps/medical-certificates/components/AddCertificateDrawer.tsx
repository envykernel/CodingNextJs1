'use client'

import React, { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import type { SelectChangeEvent } from '@mui/material'
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
  Autocomplete,
  Chip,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { useTranslation } from '@/contexts/translationContext'

import type { Patient, Doctor, CertificateTemplate } from '@/types/certificate'
import CertificateEditor from './CertificateEditor'

interface AddCertificateDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: (data: any) => void
}

export default function AddCertificateDrawer({ open, onClose, onSuccess }: AddCertificateDrawerProps) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [certificateType, setCertificateType] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({})
  const [certificateContent, setCertificateContent] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch certificate templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        console.log('Starting to fetch templates...')
        const response = await fetch('/api/certificates/templates')

        console.log('Template fetch response status:', response.status)

        if (!response.ok) {
          console.error('Template fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          })
          throw new Error('Failed to fetch templates')
        }

        const data = await response.json()

        console.log('Templates API response:', {
          hasTemplates: !!data.templates,
          templateCount: data.templates?.length,
          templates: data.templates
        })

        if (!data.templates || !Array.isArray(data.templates)) {
          console.error('Invalid templates data:', data)
          throw new Error('Invalid templates data received')
        }

        setTemplates(data.templates)
        console.log('Templates state updated:', data.templates)
      } catch (err) {
        console.error('Error in fetchTemplates:', err)
        setError('Failed to fetch templates')
      }
    }

    if (open) {
      console.log('Drawer opened, fetching templates...')
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
  }, [certificateType, selectedPatient, selectedDoctor, templateVariables])

  // Handle template variable changes
  const handleTemplateVariableChange = (key: string, value: any) => {
    setTemplateVariables(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Generate preview content based on certificate type and form values
  const getPreviewContent = () => {
    const selectedTemplate = templates.find(t => t.code === certificateType)

    if (!selectedTemplate) return ''

    let content = selectedTemplate.contentTemplate || ''

    // Replace common variables
    if (selectedPatient) {
      content = content.replace(/{{patient\.name}}/g, selectedPatient.name || '{{patient.name}}')
      content = content.replace(
        /{{patient\.birthdate}}/g,
        selectedPatient.birthdate ? new Date(selectedPatient.birthdate).toLocaleDateString() : '{{patient.birthdate}}'
      )
      content = content.replace(/{{patient\.gender}}/g, selectedPatient.gender || '{{patient.gender}}')
    }

    if (selectedDoctor) {
      content = content.replace(/{{doctor\.name}}/g, selectedDoctor.name || '{{doctor.name}}')
      content = content.replace(/{{doctor\.specialty}}/g, selectedDoctor.specialty || '{{doctor.specialty}}')
    }

    // Replace organization name
    if (session?.user?.organisationName) {
      content = content.replace(/{{organisation\.name}}/g, session.user.organisationName || '{{organisation.name}}')
    }

    // Replace template variables
    Object.entries(templateVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')

      // Keep the variable placeholder if the value is empty
      content = content.replace(regex, value?.toString() || `{{${key}}}`)
    })

    // Convert \n to actual newlines and generate HTML content
    return content
      .split('\\n')
      .map(line => `<p>${line}</p>`)
      .join('')
  }

  // Handle template variable insertion
  const handleInsertVariable = (variable: string) => {
    const editor = document.querySelector('.ProseMirror') as HTMLElement

    if (editor) {
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)

      if (range) {
        const variableText = `{{${variable}}}`
        const textNode = document.createTextNode(variableText)

        range.deleteContents()
        range.insertNode(textNode)

        // Move cursor after the inserted variable
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }

  // Render template variables section
  const renderTemplateVariables = () => {
    const selectedTemplate = templates.find(t => t.code === certificateType)

    if (!selectedTemplate?.variablesSchema?.properties) return null

    const schema = selectedTemplate.variablesSchema
    const variables = Object.entries(schema.properties)

    return (
      <Box sx={{ mb: 6 }}>
        <Typography variant='h6' gutterBottom>
          {t('Template Variables')}
        </Typography>

        {/* Quick insert variables section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            {t('Click a variable to insert it into the editor')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {variables.map(([key, prop]: [string, any]) => (
              <Chip
                key={key}
                label={prop.description || key}
                onClick={() => handleInsertVariable(key)}
                sx={{
                  fontSize: '0.9rem',
                  height: 32,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    cursor: 'pointer'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Form fields section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant='subtitle1' gutterBottom>
            {t('Edit Variable Values')}
          </Typography>
          <Grid container spacing={3}>
            {variables.map(([key, prop]: [string, any]) => {
              // Skip fields that are handled separately
              if (['startDate', 'endDate', 'notes'].includes(key)) return null

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
                          size='medium'
                        />
                      </Grid>
                    )
                  } else if (prop.enum) {
                    field = (
                      <Grid item xs={12} md={6} key={key}>
                        <FormControl fullWidth size='medium'>
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
                      <Grid item xs={12} md={6} key={key}>
                        <TextField
                          fullWidth
                          label={prop.description || key}
                          value={templateVariables[key] || ''}
                          onChange={e => handleTemplateVariableChange(key, e.target.value)}
                          required={schema.required?.includes(key)}
                          multiline={key.includes('description') || key.includes('notes')}
                          rows={key.includes('description') || key.includes('notes') ? 3 : 1}
                          size='medium'
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
                        size='medium'
                      />
                    </Grid>
                  )
                  break

                case 'boolean':
                  field = (
                    <Grid item xs={12} md={6} key={key}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!templateVariables[key]}
                            onChange={e => handleTemplateVariableChange(key, e.target.checked)}
                          />
                        }
                        label={prop.description || key}
                      />
                    </Grid>
                  )
                  break

                default:
                  return null
              }

              return field
            })}
          </Grid>
        </Box>
      </Box>
    )
  }

  const handleCertificateTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value

    setCertificateType(type)
    setFormErrors({})
    setError(null)
    setTemplateVariables({})
    setCertificateContent('')

    const selectedTemplate = templates.find(t => t.code === type)

    if (selectedTemplate) {
      // Initialize template variables with empty values
      const initialVariables: Record<string, any> = {}

      if (selectedTemplate.variablesSchema?.properties) {
        Object.keys(selectedTemplate.variablesSchema.properties).forEach(key => {
          initialVariables[key] = ''
        })
      }

      setTemplateVariables(initialVariables)
    }
  }

  const handleDoctorChange = (_: React.SyntheticEvent, newValue: Doctor | null) => {
    setSelectedDoctor(newValue)
  }

  const handlePatientChange = (event: any, newValue: Patient | null) => {
    setSelectedPatient(newValue)
    setFormErrors({})
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setFormErrors({})

    // Validate required fields
    const errors: Record<string, string> = {}

    if (!certificateType) errors.certificateType = t('Certificate type is required')
    if (!selectedDoctor) errors.doctorId = t('Doctor is required')
    if (!selectedPatient) errors.patientId = t('Patient is required')

    // Validate template variables
    const selectedTemplate = templates.find(t => t.code === certificateType)

    if (selectedTemplate?.variablesSchema?.required) {
      selectedTemplate.variablesSchema.required.forEach((field: string) => {
        if (!templateVariables[field]) {
          errors[field] = t('This field is required')
        }
      })
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)

      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: selectedPatient?.id,
          type: certificateType,
          doctorId: selectedDoctor?.id,
          content: certificateContent,
          variables: templateVariables
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || t('Failed to create certificate'))
      }

      // Show success message before closing
      setSuccessMessage(t('Certificate created successfully'))

      // Wait a moment to show the success message before closing
      setTimeout(() => {
        onSuccess(data)
        handleClose()
      }, 1500)
    } catch (err) {
      console.error('Error creating certificate:', err)
      setError(err instanceof Error ? err.message : t('An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccessMessage(null)
    setFormErrors({})
    setCertificateType('')
    setSelectedDoctor(null)
    setSelectedPatient(null)
    setCertificateContent('')
    setTemplateVariables({})
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor='right'
      PaperProps={{
        sx: {
          width: '50%',
          '@media (max-width: 1200px)': {
            width: '75%'
          },
          '@media (max-width: 600px)': {
            width: '100%'
          },
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
                    error={!!formErrors.certificateType}
                  >
                    {templates.length === 0 ? (
                      <MenuItem disabled>{t('No templates available')}</MenuItem>
                    ) : (
                      templates.map(template => (
                        <MenuItem key={template.id} value={template.code}>
                          {template.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {formErrors.certificateType && (
                    <Typography color='error' variant='caption'>
                      {formErrors.certificateType}
                    </Typography>
                  )}
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

              {/* Template variables section - now directly in the form */}
              {certificateType && (
                <Grid item xs={12}>
                  {renderTemplateVariables()}
                </Grid>
              )}

              {/* Certificate editor */}
              <Grid item xs={12}>
                <CertificateEditor
                  content={certificateContent}
                  onChange={setCertificateContent}
                  label={t('Certificate Content')}
                  templateVariables={{
                    ...templateVariables,
                    ...(selectedPatient
                      ? {
                          'patient.name': selectedPatient.name,
                          'patient.birthdate': selectedPatient.birthdate
                            ? new Date(selectedPatient.birthdate).toLocaleDateString()
                            : '',
                          'patient.gender': selectedPatient.gender
                        }
                      : {}),
                    ...(selectedDoctor
                      ? {
                          'doctor.name': selectedDoctor.name,
                          'doctor.specialty': selectedDoctor.specialty
                        }
                      : {}),
                    ...(session?.user?.organisationName
                      ? {
                          'organisation.name': session.user.organisationName
                        }
                      : {})
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
                  {error && (
                    <Alert severity='error' sx={{ flexGrow: 1 }}>
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert severity='success' sx={{ flexGrow: 1 }}>
                      {successMessage}
                    </Alert>
                  )}
                  <Button variant='outlined' onClick={handleClose} disabled={isLoading}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  >
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
