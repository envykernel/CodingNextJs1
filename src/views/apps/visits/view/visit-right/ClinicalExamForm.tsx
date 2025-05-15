'use client'

import React, { useState, useEffect } from 'react'

import { TextField, Button, Grid, Card, CardContent, Typography } from '@mui/material'
import Alert from '@mui/material/Alert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import CustomAutocomplete from '@core/components/mui/Autocomplete'

interface ClinicalExamFormProps {
  visitId: number
  dictionary: any
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

const ClinicalExamForm: React.FC<ClinicalExamFormProps> = ({ visitId, dictionary, initialValues, onVisitUpdate }) => {
  const t = dictionary.clinicalExamForm
  const tSections = t.sections

  const [selectedSections, setSelectedSections] = useState<string[]>(generalSectionKeys)

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
            options={sectionKeys}
            value={selectedSections}
            onChange={(_e, value) => setSelectedSections(value)}
            getOptionLabel={key => tSections[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] || key}
            renderInput={params => <TextField {...params} label={t.selectSections} variant='outlined' size='small' />}
            fullWidth
          />
        </div>
        <Typography variant='h6' className='mb-4'>
          {t.title}
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Grid container spacing={2}>
            {selectedSections.includes('chief_complaint') && (
              <Grid item xs={12} className='mb-3'>
                <TextField
                  label={t.chiefComplaint}
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
                  label={t.historyIllness}
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
                  label={t.medicalHistory}
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
                  label={t.generalAppearance}
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
                  label={t.cardiovascular}
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
                  label={t.respiratory}
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
                  label={t.gastrointestinal}
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
                  label={t.neurological}
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
                  label={t.musculoskeletal}
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
                  label={t.skin}
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
                  label={t.ent}
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
                  label={t.assessment}
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
                  label={t.plan}
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
                  {t.savedSuccessfully}
                </Alert>
              </Grid>
            )}
            <Grid item>
              <Button type='submit' variant='contained' color='primary' disabled={loading}>
                {loading ? t.saving : t.save}
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
