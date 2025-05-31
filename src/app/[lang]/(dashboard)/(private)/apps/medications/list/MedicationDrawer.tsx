'use client'

import { useState, useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'

interface Medication {
  id: number
  name: string
  category: string | null
  dosages: string[]
  organisation_id: number | null
}

interface MedicationDrawerProps {
  open: boolean
  onClose: () => void
  medication: Medication | null
  onSave: () => void
}

// Zod schema for medication form
const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  category: z.string().min(1, 'Category is required'),
  dosages: z.array(z.string()).min(1, 'At least one dosage is required')
})

type MedicationFormValues = z.infer<typeof medicationSchema>

export default function MedicationDrawer({ open, onClose, medication, onSave }: MedicationDrawerProps) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [currentDosage, setCurrentDosage] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      category: '',
      dosages: []
    }
  })

  useEffect(() => {
    if (medication) {
      reset({
        name: medication.name,
        category: medication.category || '',
        dosages: medication.dosages
      })
    } else {
      reset({
        name: '',
        category: '',
        dosages: []
      })
    }
  }, [medication, reset])

  const onSubmit = async (data: MedicationFormValues) => {
    try {
      const url = medication ? `/api/medications/${medication.id}` : '/api/medications'
      const method = medication ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          organisation_id: session?.user?.organisationId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save medication')
      }

      onSave()
    } catch (error) {
      console.error('Error saving medication:', error)
      alert(t('errorSavingMedication') || 'Error saving medication')
    }
  }

  const handleAddDosage = (dosages: string[], setValue: (value: string[]) => void) => {
    if (currentDosage && !dosages.includes(currentDosage)) {
      setValue([...dosages, currentDosage])
      setCurrentDosage('')
    }
  }

  const handleRemoveDosage = (dosages: string[], setValue: (value: string[]) => void, dosageToRemove: string) => {
    setValue(dosages.filter(dosage => dosage !== dosageToRemove))
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>
            {medication ? t('editMedication') || 'Edit Medication' : t('addMedication') || 'Add Medication'}
          </Typography>
          <IconButton size='small' onClick={onClose}>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('medication') || 'Medication Name'}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 4 }}
              />
            )}
          />

          <Controller
            name='category'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.category} sx={{ mb: 4 }}>
                <InputLabel>{t('category') || 'Category'}</InputLabel>
                <Select {...field} label={t('category') || 'Category'}>
                  <MenuItem value='antibiotic'>{t('antibiotic') || 'Antibiotic'}</MenuItem>
                  <MenuItem value='painRelief'>{t('painRelief') || 'Pain Relief'}</MenuItem>
                  <MenuItem value='antacid'>{t('antacid') || 'Antacid'}</MenuItem>
                  <MenuItem value='diabetes'>{t('diabetes') || 'Diabetes'}</MenuItem>
                </Select>
                {errors.category && (
                  <Typography variant='caption' color='error'>
                    {errors.category.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name='dosages'
            control={control}
            render={({ field }) => (
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label={t('dosage') || 'Add Dosage'}
                  value={currentDosage}
                  onChange={e => setCurrentDosage(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddDosage(field.value, field.onChange)
                    }
                  }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {field.value.map((dosage, index) => (
                    <Chip
                      key={index}
                      label={dosage}
                      onDelete={() => handleRemoveDosage(field.value, field.onChange, dosage)}
                    />
                  ))}
                </Box>
                {errors.dosages && (
                  <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
                    {errors.dosages.message}
                  </Typography>
                )}
              </Box>
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant='outlined' onClick={onClose}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button type='submit' variant='contained'>
              {medication ? t('save') || 'Save' : t('add') || 'Add'}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
