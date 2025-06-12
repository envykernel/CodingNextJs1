'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Autocomplete,
  TextField,
  List,
  ListItem,
  ListItemText,
  Alert,
  Grid,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'

interface LabTestType {
  id: number
  name: string
  category?: string
  default_unit?: string
  default_reference_range?: string
}

interface Doctor {
  id: number
  name: string
  specialty?: string | null
}

interface LabTestOrderFormProps {
  visitId: number
  dictionary: any
  initialValues?: any
  onVisitUpdate?: (updatedVisit: any) => void
  doctorName: string
  doctorId: number
}

const LabTestOrderForm: React.FC<LabTestOrderFormProps> = ({
  visitId,
  dictionary,
  initialValues,
  onVisitUpdate,
  doctorName,
  doctorId
}) => {
  const { data: session } = useSession()
  const [testTypes, setTestTypes] = useState<LabTestType[]>([])
  const [selectedTests, setSelectedTests] = useState<LabTestType[]>([])
  const [testDetails, setTestDetails] = useState<any>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [savedOrderId, setSavedOrderId] = useState<number | null>(null)

  const fetchAndPrefillOrders = useCallback(() => {
    setInitialLoading(true)

    return fetch(`/api/lab-test-orders-by-visit?visitId=${visitId}`)
      .then(res => res.json())
      .then(orders => {
        if (!Array.isArray(orders)) return
        if (orders.length > 0) {
          setSavedOrderId(orders[0].id)
        }
        setSelectedTests(
          orders.map((order: any) => ({
            id: order.test_type.id,
            name: order.test_type.name,
            category: order.test_type.category,
            default_unit: order.test_type.default_unit,
            default_reference_range: order.test_type.default_reference_range
          }))
        )
        setTestDetails((prev: any) => {
          const details: any = { ...prev }

          orders.forEach((order: any) => {
            details[order.test_type.id] = {
              result_value: order.result_value || '',
              result_unit: order.result_unit || order.test_type.default_unit || '',
              reference_range: order.reference_range || order.test_type.default_reference_range || '',
              notes: order.notes || ''
            }
          })

          return details
        })
      })
      .finally(() => setInitialLoading(false))
  }, [visitId])

  // Fetch doctors when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors')
        if (!res.ok) throw new Error('Failed to fetch doctors')
        const data = await res.json()
        // setDoctors(data)

        // If current user is a doctor, find and select them
        if (session?.user?.role === 'DOCTOR') {
          const currentDoctor = data.find((d: Doctor) => d.name === session.user.name)
          if (currentDoctor) {
            // setSelectedDoctor(currentDoctor)
          }
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
      }
    }

    fetchDoctors()
  }, [session])

  // Only fetch data when component mounts
  useEffect(() => {
    Promise.all([
      fetchAndPrefillOrders(),
      fetch('/api/lab-test-types')
        .then(res => res.json())
        .then(setTestTypes)
    ]).finally(() => setInitialLoading(false))
  }, []) // Remove fetchAndPrefillOrders from dependencies

  // Reset details for removed tests
  useEffect(() => {
    setTestDetails((prev: Record<number, any>) => {
      const newDetails: any = {}

      selectedTests.forEach(test => {
        newDetails[test.id] = prev[test.id] || {
          result_value: '',
          result_unit: test.default_unit || '',
          reference_range: test.default_reference_range || '',
          notes: '',
          status: 'pending'
        }
      })

      return newDetails
    })
  }, [selectedTests])

  const handleDetailChange = (testId: number, field: string, value: string) => {
    setTestDetails((prev: any) => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)
    setLoading(true)

    try {
      // Get the visit data to include required fields
      const visitRes = await fetch(`/api/visits/${visitId}`)
      if (!visitRes.ok) throw new Error('Failed to fetch visit data')
      const visitData = await visitRes.json()

      console.log('Visit data:', visitData)
      console.log('Doctor ID from props:', doctorId)

      if (!doctorId) {
        console.error('No doctor ID provided')
        throw new Error(dictionary?.testForm?.noDoctorError || 'No doctor assigned to this visit')
      }

      const tests = selectedTests.map(test => {
        const resultValue = testDetails[test.id]?.result_value || ''
        return {
          id: test.id,
          result_value: resultValue,
          result_unit: testDetails[test.id]?.result_unit || '',
          reference_range: testDetails[test.id]?.reference_range || '',
          notes: testDetails[test.id]?.notes || '',
          status: resultValue.trim() !== '' ? 'completed' : 'pending'
        }
      })

      const requestBody = {
        visitId,
        patientId: visitData.visit.patient_id,
        doctorId: doctorId,
        organisationId: visitData.visit.organisation_id,
        tests
      }

      console.log('Submitting request with body:', requestBody)

      const res = await fetch('/api/lab-test-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Response data:', data)
        setSuccess(dictionary?.testForm?.savedSuccessfully || 'Analyse enregistrée avec succès !')

        // Get the first lab test order ID from the results
        if (data.results && data.results.length > 0) {
          setSavedOrderId(data.results[0].id)
        }

        if (onVisitUpdate) {
          // Always fetch the latest visit data after saving
          try {
            const updatedVisitRes = await fetch(`/api/visits/${visitId}`)
            if (updatedVisitRes.ok) {
              const updatedVisitData = await updatedVisitRes.json()
              onVisitUpdate(updatedVisitData.visit)
            }
          } catch (err) {
            console.error('Failed to fetch updated visit data after saving lab test order', err)
          }
        }
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('API error:', errorData)
        setError(errorData.error || dictionary?.testForm?.error || "Erreur lors de l'enregistrement de l'analyse")
      }
    } catch (error) {
      console.error('Error saving lab test orders:', error)
      setError(dictionary?.testForm?.error || "Erreur lors de l'enregistrement de l'analyse")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const content = `
      <html>
        <head>
          <title>${dictionary?.testForm?.title || 'Test Order'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .test-item { margin-bottom: 20px; }
            .test-name { font-weight: bold; margin-bottom: 10px; }
            .test-details { margin-left: 20px; }
            .test-row { margin-bottom: 5px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${dictionary?.testForm?.title || 'Test Order'}</h1>
          <div class="no-print">
            <button onclick="window.print()">Print</button>
          </div>
          ${selectedTests
            .map(
              test => `
            <div class="test-item">
              <div class="test-name">${test.name}</div>
              <div class="test-details">
                <div class="test-row">
                  <strong>${dictionary?.testForm?.result || 'Result'}:</strong> ${testDetails[test.id]?.result_value || ''}
                </div>
                <div class="test-row">
                  <strong>${dictionary?.testForm?.unit || 'Unit'}:</strong> ${testDetails[test.id]?.result_unit || ''}
                </div>
                <div class="test-row">
                  <strong>${dictionary?.testForm?.referenceRange || 'Reference Range'}:</strong> ${testDetails[test.id]?.reference_range || ''}
                </div>
                <div class="test-row">
                  <strong>${dictionary?.testForm?.notes || 'Notes'}:</strong> ${testDetails[test.id]?.notes || ''}
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
  }

  return (
    <Card>
      <CardHeader
        title={dictionary?.testForm?.title || 'Analyses de laboratoire'}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(savedOrderId || initialValues?.id) && (
              <Link
                href={`/${dictionary?.locale || 'fr'}/apps/lab-tests/print/${savedOrderId || initialValues?.id}`}
                target='_blank'
                rel='noopener'
                passHref
              >
                <Button variant='outlined' color='primary' startIcon={<PrintIcon />}>
                  {dictionary?.testForm?.print || "Imprimer l'analyse"}
                </Button>
              </Link>
            )}
          </Box>
        }
      />
      <CardContent>
        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2'>
                {dictionary?.navigation?.doctor || 'Doctor'}: <b>{doctorName || '-'}</b>
              </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
              <Autocomplete
                multiple
                options={testTypes}
                getOptionLabel={option => option.name}
                value={selectedTests}
                onChange={(_e, value) => setSelectedTests(value)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={dictionary?.testForm?.selectTest || 'Sélectionner un test'}
                    placeholder={dictionary?.testForm?.selectTest || 'Sélectionner un test'}
                  />
                )}
                sx={{ mb: 2 }}
              />
              {selectedTests.length > 0 && (
                <List dense>
                  {selectedTests.map(test => (
                    <ListItem
                      key={test.id}
                      alignItems='flex-start'
                      sx={{ flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <ListItemText
                        primary={test.name}
                        secondary={
                          test.category
                            ? `${dictionary?.testForm?.category || 'Catégorie'}: ${test.category}`
                            : undefined
                        }
                      />
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label={dictionary?.testForm?.result || 'Résultat'}
                            value={testDetails[test.id]?.result_value || ''}
                            onChange={e => handleDetailChange(test.id, 'result_value', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            label={dictionary?.testForm?.unit || 'Unité'}
                            value={testDetails[test.id]?.result_unit || ''}
                            onChange={e => handleDetailChange(test.id, 'result_unit', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label={dictionary?.testForm?.referenceRange || 'Valeurs de référence'}
                            value={testDetails[test.id]?.reference_range || ''}
                            onChange={e => handleDetailChange(test.id, 'reference_range', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label={dictionary?.testForm?.notes || 'Notes'}
                            value={testDetails[test.id]?.notes || ''}
                            onChange={e => handleDetailChange(test.id, 'notes', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                {success && (
                  <Alert
                    severity='success'
                    sx={{
                      flex: 1,
                      mb: 0,
                      '& .MuiAlert-message': {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }
                    }}
                  >
                    {success}
                  </Alert>
                )}
                <Button
                  type='button'
                  variant='outlined'
                  color='secondary'
                  onClick={fetchAndPrefillOrders}
                  disabled={loading}
                >
                  {dictionary?.navigation?.cancel || 'Annuler'}
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  disabled={loading}
                  startIcon={loading ? <i className='tabler-loader animate-spin' /> : undefined}
                >
                  {loading
                    ? dictionary?.testForm?.saving || 'Enregistrement...'
                    : dictionary?.testForm?.save || 'Enregistrer'}
                </Button>
              </Box>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default LabTestOrderForm
