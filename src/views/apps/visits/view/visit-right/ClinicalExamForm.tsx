'use client'

import React, { useState, useEffect } from 'react'

import { TextField, Button, Grid, Card, CardContent, Typography, Chip, Box, Paper, Divider } from '@mui/material'
import Alert from '@mui/material/Alert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import HistoryIcon from '@mui/icons-material/History'
import AssessmentIcon from '@mui/icons-material/Assessment'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import AirIcon from '@mui/icons-material/Air'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import SpaIcon from '@mui/icons-material/Spa'
import HearingIcon from '@mui/icons-material/Hearing'
import DescriptionIcon from '@mui/icons-material/Description'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BiotechIcon from '@mui/icons-material/Biotech'

import { useTranslation } from '@/contexts/translationContext'

type SectionKey =
  | 'chief_complaint'
  | 'history_illness'
  | 'medical_history'
  | 'general_appearance'
  | 'cardiovascular'
  | 'respiratory'
  | 'gastrointestinal'
  | 'neurological'
  | 'musculoskeletal'
  | 'skin'
  | 'ent'
  | 'assessment'
  | 'plan'

interface ClinicalExamFormProps {
  visitId: number
  initialValues?: any
  onVisitUpdate?: (updatedVisit: any) => void
}

const initialState = {
  chief_complaint: '',
  history_illness: '',
  medical_history: '',
  general_appearance: '',
  cardiovascular: '',
  respiratory: '',
  gastrointestinal: '',
  neurological: '',
  musculoskeletal: '',
  skin: '',
  ent: '',
  assessment: '',
  plan: ''
}

const generalSectionKeys = [
  'chief_complaint',
  'history_illness',
  'medical_history',
  'general_appearance',
  'assessment',
  'plan'
]

const sectionCategories = {
  general: {
    titleKey: 'clinicalExamForm.categories.general',
    sections: ['chief_complaint', 'history_illness', 'medical_history', 'general_appearance'] as SectionKey[],
    icon: MedicalServicesIcon
  },
  examination: {
    titleKey: 'clinicalExamForm.categories.examination',
    sections: [
      'cardiovascular',
      'respiratory',
      'gastrointestinal',
      'neurological',
      'musculoskeletal',
      'skin',
      'ent'
    ] as SectionKey[],
    icon: AssessmentIcon
  },
  conclusion: {
    titleKey: 'clinicalExamForm.categories.conclusion',
    sections: ['assessment', 'plan'] as SectionKey[],
    icon: DescriptionIcon
  }
} as const

const sectionIcons = {
  chief_complaint: MedicalServicesIcon,
  history_illness: HistoryIcon,
  medical_history: HistoryIcon,
  general_appearance: AssessmentIcon,
  cardiovascular: MonitorHeartIcon,
  respiratory: AirIcon,
  gastrointestinal: BiotechIcon,
  neurological: PsychologyIcon,
  musculoskeletal: AccessibilityNewIcon,
  skin: SpaIcon,
  ent: HearingIcon,
  assessment: DescriptionIcon,
  plan: AssignmentIcon
} as const

const ClinicalExamForm: React.FC<ClinicalExamFormProps> = ({ visitId, initialValues, onVisitUpdate }) => {
  const { t } = useTranslation()

  const tSections = {
    chiefComplaint: t('clinicalExamForm.sections.chiefComplaint'),
    historyIllness: t('clinicalExamForm.sections.historyIllness'),
    medicalHistory: t('clinicalExamForm.sections.medicalHistory'),
    generalAppearance: t('clinicalExamForm.sections.generalAppearance'),
    cardiovascular: t('clinicalExamForm.sections.cardiovascular'),
    respiratory: t('clinicalExamForm.sections.respiratory'),
    gastrointestinal: t('clinicalExamForm.sections.gastrointestinal'),
    neurological: t('clinicalExamForm.sections.neurological'),
    musculoskeletal: t('clinicalExamForm.sections.musculoskeletal'),
    skin: t('clinicalExamForm.sections.skin'),
    ent: t('clinicalExamForm.sections.ent'),
    assessment: t('clinicalExamForm.sections.assessment'),
    plan: t('clinicalExamForm.sections.plan')
  } as const

  // Initialize selectedSections based on initialValues
  const getInitialSelectedSections = () => {
    if (!initialValues) return generalSectionKeys as SectionKey[]

    // Get all sections that have values
    const sectionsWithValues = Object.entries(initialValues)
      .filter(([, value]) => value != null && value !== '')
      .map(([key]) => key as SectionKey)

    // If no sections have values, return general sections
    if (sectionsWithValues.length === 0) return generalSectionKeys as SectionKey[]

    // Return all sections that have values
    return sectionsWithValues
  }

  const [selectedSections, setSelectedSections] = useState<SectionKey[]>(getInitialSelectedSections())

  // Initialize form state
  const [form, setForm] = useState(() => {
    if (initialValues) {
      return {
        ...initialState,
        ...Object.fromEntries(Object.entries(initialValues).map(([k, v]) => [k, v == null ? '' : v]))
      }
    }

    return initialState
  })

  // Update both form and selectedSections when initialValues change
  useEffect(() => {
    if (initialValues) {
      // Update form values
      setForm({
        ...initialState,
        ...Object.fromEntries(Object.entries(initialValues).map(([k, v]) => [k, v == null ? '' : v]))
      })

      // Update selected sections
      const sectionsWithValues = Object.entries(initialValues)
        .filter(([, value]) => value != null && value !== '')
        .map(([key]) => key as SectionKey)

      if (sectionsWithValues.length > 0) {
        setSelectedSections(sectionsWithValues)
      }
    }
  }, [initialValues])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000)

      return () => clearTimeout(timer)
    }
  }, [success])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/clinical-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, visit_id: visitId })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)

        // Fetch updated visit data and update parent
        if (onVisitUpdate) {
          const visitRes = await fetch(`/api/visits/${visitId}`)

          if (visitRes.ok) {
            const { visit } = await visitRes.json()

            onVisitUpdate(visit)
          }
        }
      } else {
        setError(data.error || 'Error')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: SectionKey) => {
    setSelectedSections(prev => (prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]))
  }

  const toggleCategory = (category: keyof typeof sectionCategories) => {
    const categorySections = sectionCategories[category].sections as SectionKey[]
    const allSelected = categorySections.every(section => selectedSections.includes(section))

    setSelectedSections(prev => {
      if (allSelected) {
        return prev.filter(section => !categorySections.includes(section))
      } else {
        const newSections = [...prev]

        categorySections.forEach(section => {
          if (!newSections.includes(section)) {
            newSections.push(section)
          }
        })

        return newSections
      }
    })
  }

  return (
    <Card className='mt-6'>
      <CardContent>
        {/* Section selector */}
        <Box className='mb-6'>
          <Typography variant='h6' className='mb-4'>
            {t('clinicalExamForm.selectSections')}
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(sectionCategories).map(([category, { titleKey, sections, icon: Icon }]) => (
              <Grid item xs={12} key={category}>
                <Paper
                  elevation={2}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      boxShadow: theme => theme.shadows[4]
                    }
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50'),
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'grey.100')
                      },
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => toggleCategory(category as keyof typeof sectionCategories)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icon
                          sx={{
                            mr: 2,
                            color: 'primary.main',
                            fontSize: 24,
                            filter: theme => (theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none')
                          }}
                        />
                        <Typography
                          variant='h6'
                          fontWeight='medium'
                          sx={{
                            color: 'primary.main',
                            filter: theme => (theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none')
                          }}
                        >
                          {t(titleKey)}
                        </Typography>
                      </Box>
                      <Chip
                        size='small'
                        label={`${sections.filter(s => selectedSections.includes(s as SectionKey)).length}/${sections.length}`}
                        color={sections.every(s => selectedSections.includes(s as SectionKey)) ? 'primary' : 'default'}
                        sx={{
                          fontWeight: 'medium',
                          '& .MuiChip-label': {
                            px: 1
                          },
                          bgcolor: theme =>
                            sections.every(s => selectedSections.includes(s as SectionKey))
                              ? 'primary.main'
                              : theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.08)'
                                : 'grey.100'
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography
                      variant='subtitle2'
                      sx={{
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 'medium',
                        color: 'text.secondary',
                        opacity: 0.9
                      }}
                    >
                      {t('clinicalExamForm.availableSections')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {sections.map(section => {
                        const SectionIcon = sectionIcons[section as keyof typeof sectionIcons]
                        const isSelected = selectedSections.includes(section as SectionKey)

                        return (
                          <Chip
                            key={section}
                            icon={<SectionIcon />}
                            label={
                              tSections[
                                section.replace(/_([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof tSections
                              ]
                            }
                            onClick={() => toggleSection(section as SectionKey)}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: theme =>
                                  isSelected
                                    ? theme.palette.primary.dark
                                    : theme.palette.mode === 'dark'
                                      ? 'rgba(255, 255, 255, 0.08)'
                                      : 'action.hover'
                              },
                              transition: 'all 0.2s ease-in-out',
                              borderColor: theme =>
                                theme.palette.mode === 'dark' && !isSelected ? 'rgba(255, 255, 255, 0.23)' : undefined,
                              '& .MuiChip-icon': {
                                color: theme =>
                                  isSelected
                                    ? theme.palette.primary.contrastText
                                    : theme.palette.mode === 'dark'
                                      ? 'rgba(255, 255, 255, 0.7)'
                                      : undefined
                              }
                            }}
                          />
                        )
                      })}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : undefined)
          }}
        />

        <Typography variant='h6' className='mb-4'>
          {t('clinicalExamForm.title')}
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Grid container spacing={2}>
            {selectedSections.includes('chief_complaint') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.chiefComplaint')}
                  name='chief_complaint'
                  value={form.chief_complaint}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('history_illness') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.historyIllness')}
                  name='history_illness'
                  value={form.history_illness}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('medical_history') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.medicalHistory')}
                  name='medical_history'
                  value={form.medical_history}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('general_appearance') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.generalAppearance')}
                  name='general_appearance'
                  value={form.general_appearance}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('cardiovascular') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.cardiovascular')}
                  name='cardiovascular'
                  value={form.cardiovascular}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('respiratory') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.respiratory')}
                  name='respiratory'
                  value={form.respiratory}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('gastrointestinal') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.gastrointestinal')}
                  name='gastrointestinal'
                  value={form.gastrointestinal}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('neurological') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.neurological')}
                  name='neurological'
                  value={form.neurological}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('musculoskeletal') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.musculoskeletal')}
                  name='musculoskeletal'
                  value={form.musculoskeletal}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('skin') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.skin')}
                  name='skin'
                  value={form.skin}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('ent') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.ent')}
                  name='ent'
                  value={form.ent}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('assessment') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.assessment')}
                  name='assessment'
                  value={form.assessment}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
            {selectedSections.includes('plan') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t('clinicalExamForm.plan')}
                  name='plan'
                  value={form.plan}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            )}
          </Grid>
          <Grid container spacing={2} alignItems='center' justifyContent='flex-end' className='mt-4'>
            {success && (
              <Grid item>
                <Alert icon={<CheckCircleIcon fontSize='inherit' />} severity='success'>
                  {t('clinicalExamForm.savedSuccessfully')}
                </Alert>
              </Grid>
            )}
            <Grid item>
              <Button type='submit' variant='contained' color='primary' disabled={loading}>
                {loading ? t('clinicalExamForm.saving') : t('clinicalExamForm.save')}
              </Button>
            </Grid>
            {error && (
              <Grid item>
                <Typography color='error.main'>{error}</Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ClinicalExamForm
