'use client'

import { useEffect, useState } from 'react'

import { Box, TextField, Typography, Autocomplete, IconButton, Grid } from '@mui/material'

interface Medication {
  id: number
  name: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

interface MedicationBlockProps {
  medication: Medication
  index: number
  dictionary: any
  onMedicationChange: (index: number, field: string, value: string) => void
  onRemove: (index: number) => void
  canRemove: boolean
  errors?: any
}

export default function MedicationBlock({
  medication,
  index,
  dictionary,
  onMedicationChange,
  onRemove,
  canRemove,
  errors
}: MedicationBlockProps) {
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/medications')
      .then(res => res.json())
      .then(data => {
        setMedications(data)
        console.log('Fetched medications:', data)
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedMedication = medications.find(m => m.name === medication.name)
  const possibleDosages = selectedMedication ? selectedMedication.dosages : []

  return (
    <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      {medications.length === 0 && <Typography color='error'>No medications found in database.</Typography>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='subtitle1'>
              {dictionary?.navigation?.medication} {index + 1}
            </Typography>
            <IconButton color='error' onClick={() => onRemove(index)} disabled={!canRemove}>
              <i className='tabler-trash' />
            </IconButton>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={medications}
            getOptionLabel={option => option.name}
            value={medications.find(m => m.name === medication.name) || null}
            onChange={(_, newValue) => {
              onMedicationChange(index, 'name', newValue?.name || '')
              onMedicationChange(index, 'dosage', '')
            }}
            loading={loading}
            openOnFocus
            renderInput={params => <TextField {...params} label={dictionary?.navigation?.medication} required />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={possibleDosages}
            getOptionLabel={option => option}
            value={medication.dosage || null}
            onChange={(_, newValue) => onMedicationChange(index, 'dosage', newValue || '')}
            renderInput={params => (
              <TextField
                {...params}
                label={dictionary?.navigation?.dosage}
                required
                error={!!errors?.dosage}
                helperText={errors?.dosage?.message || ' '}
              />
            )}
            disabled={!selectedMedication}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={dictionary?.navigation?.frequency}
            value={medication.frequency}
            onChange={e => onMedicationChange(index, 'frequency', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={dictionary?.navigation?.duration}
            value={medication.duration}
            onChange={e => onMedicationChange(index, 'duration', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={dictionary?.navigation?.notes}
            value={medication.notes}
            onChange={e => onMedicationChange(index, 'notes', e.target.value)}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
