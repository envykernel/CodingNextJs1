'use client'

import { useState, useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'

import { useTranslation } from '@/contexts/translationContext'
import { formatDateToDDMMYYYY } from '@/utils/date'

// Form validation schema
const formSchema = z.object({
  exam_type_id: z.number().min(1, 'Please select an exam type'),
  notes: z.string().optional(),
  status: z.string().optional(),
  result: z.string().optional(),
  result_date: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface ExamType {
  id: number
  name: string
  category: string | null
  description: string | null
}

interface RadiologyOrderFormProps {
  visitId: number
  initialValues?: any
  onVisitUpdate: (updatedVisit?: any) => void
}

const RadiologyOrderForm = ({ visitId, initialValues, onVisitUpdate }: RadiologyOrderFormProps) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [success, setSuccess] = useState(false)
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam_type_id: initialValues?.exam_type_id || 0,
      notes: initialValues?.notes || '',
      status: initialValues?.status || 'pending',
      result: initialValues?.result || '',
      result_date: initialValues?.result_date || ''
    }
  })

  // Fetch exam types on component mount
  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        const response = await fetch('/api/radiology/exam-types')

        if (!response.ok) throw new Error('Failed to fetch exam types')
        const data = await response.json()

        setExamTypes(data)

        // Set initial exam type if editing
        if (initialValues?.exam_type_id) {
          const initialExamType = data.find((type: ExamType) => type.id === initialValues.exam_type_id)

          if (initialExamType) {
            setSelectedExamType(initialExamType)
          }
        }
      } catch (err) {
        console.error('Error fetching exam types:', err)
        setError('Failed to load exam types')
      }
    }

    fetchExamTypes()
  }, [initialValues])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/radiology/orders', {
        method: initialValues ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          visit_id: visitId,
          id: initialValues?.id,
          ordered_at: initialValues ? undefined : formatDateToDDMMYYYY(new Date())
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save radiology order')
      }

      const result = await response.json()

      setSuccess(true)
      onVisitUpdate(result.visit)

      if (!initialValues) {
        reset()
        setSelectedExamType(null)
      }
    } catch (err) {
      console.error('Error saving radiology order:', err)
      setError('Failed to save radiology order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Typography variant='h5' sx={{ mb: 4 }}>
                {t('radiology.orderForm.title') || 'Radiology Order'}
              </Typography>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity='error' onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert severity='success' onClose={() => setSuccess(false)}>
                  {t('radiology.orderForm.success') || 'Radiology order saved successfully'}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Controller
                name='exam_type_id'
                control={control}
                render={() => (
                  <Autocomplete
                    value={selectedExamType}
                    onChange={(_event, newValue) => {
                      setSelectedExamType(newValue)
                      setValue('exam_type_id', newValue?.id || 0)
                    }}
                    options={examTypes}
                    getOptionLabel={option => option.name}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={t('radiology.orderForm.examType') || 'Exam Type'}
                        error={!!errors.exam_type_id}
                        helperText={errors.exam_type_id?.message}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('radiology.orderForm.status') || 'Status'}</InputLabel>
                    <Select {...field} label={t('radiology.orderForm.status') || 'Status'}>
                      <MenuItem value='pending'>{t('radiology.orderForm.statusPending') || 'Pending'}</MenuItem>
                      <MenuItem value='completed'>{t('radiology.orderForm.statusCompleted') || 'Completed'}</MenuItem>
                      <MenuItem value='cancelled'>{t('radiology.orderForm.statusCancelled') || 'Cancelled'}</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label={t('radiology.orderForm.notes') || 'Notes'}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={9}>
              <Controller
                name='result'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={6}
                    label={t('radiology.orderForm.result') || 'Result'}
                    error={!!errors.result}
                    helperText={errors.result?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name='result_date'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='date'
                    label={t('radiology.orderForm.resultDate') || 'Result Date'}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.result_date}
                    helperText={errors.result_date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading
                  ? t('radiology.orderForm.saving') || 'Saving...'
                  : initialValues
                    ? t('radiology.orderForm.update') || 'Update Order'
                    : t('radiology.orderForm.create') || 'Create Order'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default RadiologyOrderForm
