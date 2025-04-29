'use client'

import { Box, TextField, Typography, Autocomplete, IconButton, Grid } from '@mui/material'

// Mock data for medications
const medications = [
  { id: 1, name: 'Amoxicillin', category: 'Antibiotic' },
  { id: 2, name: 'Ibuprofen', category: 'Pain Relief' },
  { id: 3, name: 'Omeprazole', category: 'Antacid' },
  { id: 4, name: 'Metformin', category: 'Diabetes' },
  { id: 5, name: 'Lisinopril', category: 'Blood Pressure' }
]

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
}

export default function MedicationBlock({
  medication,
  index,
  dictionary,
  onMedicationChange,
  onRemove,
  canRemove
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
            value={medications.find(m => m.name === medication.name) || null}
            onChange={(_, newValue) => {
              onMedicationChange(index, 'name', newValue?.name || '')
            }}
            renderInput={params => <TextField {...params} label={dictionary?.navigation?.medication} required />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={dictionary?.navigation?.dosage}
            value={medication.dosage}
            onChange={e => onMedicationChange(index, 'dosage', e.target.value)}
            required
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
