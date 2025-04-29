'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, Button, TextField, Grid, Box, Typography } from '@mui/material'

import MedicationBlock from '@/components/MedicationBlock'

// Zod schema for medication
const medicationSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  notes: z.string().optional()
})

// Zod schema for the entire form
const prescriptionSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  doctor: z.string().min(1, 'Doctor name is required'),
  medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
  notes: z.string().optional()
})

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
  dictionary: any
  initialData?: PrescriptionFormValues
  onSubmit: (data: PrescriptionFormValues) => void
  submitButtonText: string
  title: string
}

export default function PrescriptionForm({
  dictionary,
  initialData,
  onSubmit,
  submitButtonText,
  title
}: PrescriptionFormProps) {
  const params = useParams()
  const { lang: locale } = params

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData || {
      patientName: '',
      doctor: '',
      medications: [
        {
          id: 1,
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        }
      ],
      notes: ''
    }
  })

  const medications = watch('medications')

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const currentMedications = watch('medications')
    const updatedMedications = [...currentMedications]

    updatedMedications[index] = { ...updatedMedications[index], [field]: value }
    setValue('medications', updatedMedications, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }

  const addMedication = () => {
    const currentMedications = watch('medications')

    setValue('medications', [
      ...currentMedications,
      {
        id: currentMedications.length + 1,
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      }
    ])
  }

  const removeMedication = (index: number) => {
    const currentMedications = watch('medications')
    const updatedMedications = currentMedications.filter((_, i) => i !== index)

    setValue('medications', updatedMedications)
  }

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <Link href={`/${locale}/apps/prescriptions/list`} passHref>
            <Button variant='outlined' color='secondary'>
              {dictionary?.navigation?.cancel}
            </Button>
          </Link>
        }
      />
      <CardContent>
        <Box component='form' noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name='patientName'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={dictionary?.navigation?.patientName}
                    error={!!errors.patientName}
                    helperText={errors.patientName?.message || ' '}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='doctor'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={dictionary?.navigation?.doctor}
                    error={!!errors.doctor}
                    helperText={errors.doctor?.message || ' '}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>{dictionary?.navigation?.medications}</Typography>
                <Button variant='outlined' startIcon={<i className='tabler-plus' />} onClick={addMedication}>
                  {dictionary?.navigation?.addMedication}
                </Button>
              </Box>

              {medications.map((medication, index) => (
                <MedicationBlock
                  key={medication.id}
                  medication={medication}
                  index={index}
                  dictionary={dictionary}
                  onMedicationChange={handleMedicationChange}
                  onRemove={removeMedication}
                  canRemove={medications.length > 1}
                  errors={errors.medications?.[index]}
                />
              ))}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={dictionary?.navigation?.additionalNotes} multiline rows={4} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Link href={`/${locale}/apps/prescriptions/list`} passHref>
                  <Button variant='outlined' color='secondary'>
                    {dictionary?.navigation?.cancel}
                  </Button>
                </Link>
                <Button type='submit' variant='contained' color='primary'>
                  {submitButtonText}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
