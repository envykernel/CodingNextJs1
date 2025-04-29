'use client'

import { Box, TextField, Typography, Autocomplete, IconButton, Grid } from '@mui/material'

import { medications } from '@/data/medications'
import type { Medication } from '@/types/prescriptions'

interface MedicationBlockProps {
  medication: Medication
  index: number
  dictionary: any
  onMedicationChange: (index: number, field: string, value: string) => void
  onRemove: (index: number) => void
  canRemove: boolean
  errors?: {
    name?: { message?: string }
    dosage?: { message?: string }
    frequency?: { message?: string }
    duration?: { message?: string }
  }
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
  return (
    <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
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
            value={medication.name ? medications.find(m => m.name === medication.name) || null : null}
            onChange={(_, newValue) => {
              if (newValue) {
                onMedicationChange(index, 'name', newValue.name)

                // Reset other fields when medication changes
                onMedicationChange(index, 'dosage', '')
                onMedicationChange(index, 'frequency', '')
                onMedicationChange(index, 'duration', '')
              } else {
                onMedicationChange(index, 'name', '')
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={dictionary?.navigation?.medication}
                error={!!errors?.name}
                helperText={errors?.name?.message || ' '}
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={medications.find(m => m.name === medication.name)?.commonDosages || []}
            value={medication.dosage}
            onChange={(_, newValue) => {
              onMedicationChange(index, 'dosage', newValue || '')
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={dictionary?.navigation?.dosage}
                error={!!errors?.dosage}
                helperText={errors?.dosage?.message || ' '}
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={medications.find(m => m.name === medication.name)?.commonFrequency || []}
            value={medication.frequency}
            onChange={(_, newValue) => {
              onMedicationChange(index, 'frequency', newValue || '')
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={dictionary?.navigation?.frequency}
                error={!!errors?.frequency}
                helperText={errors?.frequency?.message || ' '}
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={medications.find(m => m.name === medication.name)?.commonDuration || []}
            value={medication.duration}
            onChange={(_, newValue) => {
              onMedicationChange(index, 'duration', newValue || '')
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={dictionary?.navigation?.duration}
                error={!!errors?.duration}
                helperText={errors?.duration?.message || ' '}
                required
              />
            )}
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
