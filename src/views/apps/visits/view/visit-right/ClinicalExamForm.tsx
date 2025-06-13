'use client'

import React, { useState, useEffect } from 'react'

import { TextField, Button, Grid, Card, CardContent, Typography } from '@mui/material'
import Alert from '@mui/material/Alert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import CustomAutocomplete from '@core/components/mui/Autocomplete'
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

const sectionKeys = [
  'chief_complaint',
  'history_illness',
  'medical_history',
  'general_appearance',
  'cardiovascular',
  'respiratory',
  'gastrointestinal',
  'neurological',
  'musculoskeletal',
  'skin',
  'ent',
  'assessment',
  'plan'
]

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

  const [selectedSections, setSelectedSections] = useState<SectionKey[]>(generalSectionKeys as SectionKey[])

  // Update form when initialValues change
  useEffect(() => {
    if (initialValues) {
      setForm({
        ...initialState,
        ...Object.fromEntries(Object.entries(initialValues).map(([k, v]) => [k, v == null ? '' : v]))
      })
    }
  }, [initialValues])

  const [form, setForm] = useState(() => {
    if (initialValues) {
      return {
        ...initialState,
        ...Object.fromEntries(Object.entries(initialValues).map(([k, v]) => [k, v == null ? '' : v]))
      }
    }

    return initialState
  })

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

  return (
    <Card className='mt-6'>
      <CardContent>
        {/* Section filter */}
        <div className='mb-4'>
          <CustomAutocomplete
            multiple
            options={sectionKeys as SectionKey[]}
            value={selectedSections}
            onChange={(_e, value) => setSelectedSections(value as SectionKey[])}
            getOptionLabel={key => {
              const sectionKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof tSections

              return tSections[sectionKey] || key
            }}
            renderInput={params => (
              <TextField {...params} label={t('clinicalExamForm.selectSections')} variant='outlined' size='small' />
            )}
            fullWidth
          />
        </div>
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
