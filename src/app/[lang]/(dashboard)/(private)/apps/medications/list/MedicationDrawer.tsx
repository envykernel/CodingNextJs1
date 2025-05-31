'use client'

import React, { useState, useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Autocomplete from '@mui/material/Autocomplete'
import Alert from '@mui/material/Alert'

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
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Fetch existing categories when drawer opens
  useEffect(() => {
    const fetchCategories = async () => {
      if (!open) return

      setIsLoadingCategories(true)

      try {
        const response = await fetch('/api/medications')

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = (await response.json()) as Medication[]

        // Get unique categories, filtering out null values and ensuring they are strings
        const categories = Array.from(
          new Set(
            data.map(med => med.category).filter((category: string | null): category is string => category !== null)
          )
        )

        setExistingCategories(categories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [open])

  // Reset form and states when drawer opens/closes
  useEffect(() => {
    if (open) {
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

      setCurrentDosage('')
      setCustomCategory('')
    }
  }, [open, medication, reset])

  const handleClose = () => {
    // Reset all states
    setCurrentDosage('')
    setCustomCategory('')
    setShowSuccess(false)
    setIsSubmitting(false)
    reset({
      name: '',
      category: '',
      dosages: []
    })
    onClose()
  }

  const onSubmit = async (data: MedicationFormValues) => {
    setIsSubmitting(true)

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

      // Show success message
      setShowSuccess(true)

      // Wait for 1.5 seconds to show the success message before closing
      setTimeout(() => {
        onSave()
        handleClose()
      }, 1500)
    } catch (error) {
      console.error('Error saving medication:', error)
      alert(t('errorSavingMedication') || 'Error saving medication')
      setIsSubmitting(false)
    }
  }

  const handleAddDosage = (dosages: string[], setValue: (value: string[]) => void) => {
    if (currentDosage.trim() && !dosages.includes(currentDosage.trim())) {
      setValue([...dosages, currentDosage.trim()])
      setCurrentDosage('')
    }
  }

  const handleRemoveDosage = (dosages: string[], setValue: (value: string[]) => void, indexToRemove: number) => {
    setValue(dosages.filter((_, index) => index !== indexToRemove))
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>
            {medication ? t('editMedication') || 'Edit Medication' : t('addMedication') || 'Add Medication'}
          </Typography>
          <IconButton size='small' onClick={handleClose}>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        {showSuccess && (
          <Alert
            severity='success'
            sx={{
              mb: 4,
              '& .MuiAlert-message': {
                fontSize: '0.875rem'
              }
            }}
          >
            {medication
              ? t('medicationUpdated') || 'Medication updated successfully'
              : t('medicationAdded') || 'Medication added successfully'}
          </Alert>
        )}

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
              <Autocomplete
                {...field}
                freeSolo
                options={existingCategories}
                loading={isLoadingCategories}
                inputValue={customCategory}
                onInputChange={(_, newValue) => {
                  setCustomCategory(newValue)
                }}
                onChange={(_, value) => {
                  // Only update the form value if it's an existing category
                  if (typeof value === 'string' && existingCategories.includes(value)) {
                    field.onChange(value)
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customCategory.trim()) {
                    e.preventDefault()

                    // Add the custom category to the list if it doesn't exist
                    if (!existingCategories.includes(customCategory.trim())) {
                      setExistingCategories(prev => [...prev, customCategory.trim()])
                    }

                    // Update the form value
                    field.onChange(customCategory.trim())
                    setCustomCategory('')
                  }
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={t('category') || 'Category'}
                    error={!!errors.category}
                    helperText={
                      errors.category?.message ||
                      (customCategory && !existingCategories.includes(customCategory)
                        ? t('pressEnterToAdd') || 'Press Enter to add this category'
                        : '')
                    }
                    placeholder={t('selectOrTypeCategory') || 'Select or type a category and press Enter'}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props

                  return (
                    <li key={key} {...otherProps}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-tag' />
                        {option}
                      </Box>
                    </li>
                  )
                }}
                sx={{ mb: 4 }}
              />
            )}
          />

          <Controller
            name='dosages'
            control={control}
            render={({ field }) => (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
                    placeholder={t('enterDosage') || 'Enter dosage (e.g., 500mg, 1 tablet)'}
                  />
                  <Button
                    variant='contained'
                    onClick={() => handleAddDosage(field.value, field.onChange)}
                    disabled={!currentDosage.trim()}
                    sx={{ minWidth: '100px' }}
                  >
                    {t('add') || 'Add'}
                  </Button>
                </Box>

                {field.value.length > 0 ? (
                  <Paper variant='outlined' sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <List dense>
                      {field.value.map((dosage, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={dosage}
                              primaryTypographyProps={{
                                sx: {
                                  fontSize: '0.875rem',
                                  color: 'text.primary'
                                }
                              }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge='end'
                                size='small'
                                onClick={() => handleRemoveDosage(field.value, field.onChange, index)}
                                sx={{ color: 'error.main' }}
                              >
                                <i className='tabler-trash' />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < field.value.length - 1 && <Divider component='li' />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                ) : (
                  <Typography
                    variant='body2'
                    sx={{
                      textAlign: 'center',
                      color: 'text.secondary',
                      py: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }}
                  >
                    {t('noDosagesAdded') || 'No dosages added yet'}
                  </Typography>
                )}

                {errors.dosages && (
                  <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
                    {errors.dosages.message}
                  </Typography>
                )}
              </Box>
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant='outlined' onClick={handleClose} disabled={isSubmitting}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button type='submit' variant='contained' disabled={isSubmitting}>
              {isSubmitting ? t('saving') || 'Saving...' : medication ? t('save') || 'Save' : t('add') || 'Add'}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
