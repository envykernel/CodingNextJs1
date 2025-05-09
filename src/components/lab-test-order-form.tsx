'use client'
import React, { useState, useEffect, useCallback } from 'react'

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
  Box
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

interface LabTestType {
  id: number
  name: string
  category?: string
  default_unit?: string
  default_reference_range?: string
}

interface LabTestOrderFormProps {
  dictionary: any
  submitButtonText: string
  title: string
  visitId: number
  patientId: number
  doctorId?: number | null
  organisationId: number
}

const LabTestOrderForm: React.FC<LabTestOrderFormProps> = ({
  dictionary,
  submitButtonText,
  title,
  visitId,
  patientId,
  doctorId,
  organisationId
}) => {
  const [testTypes, setTestTypes] = useState<LabTestType[]>([])
  const [selectedTests, setSelectedTests] = useState<LabTestType[]>([])
  const [testDetails, setTestDetails] = useState<any>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAndPrefillOrders = useCallback(() => {
    fetch(`/api/lab-test-orders-by-visit?visitId=${visitId}`)
      .then(res => res.json())
      .then(orders => {
        if (!Array.isArray(orders)) return
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
  }, [visitId])

  useEffect(() => {
    fetchAndPrefillOrders()
  }, [fetchAndPrefillOrders])

  useEffect(() => {
    fetch('/api/lab-test-types')
      .then(res => res.json())
      .then(setTestTypes)
  }, [])

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

      const res = await fetch('/api/lab-test-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId,
          patientId,
          doctorId,
          organisationId,
          tests
        })
      })

      if (res.ok) {
        setSuccess(dictionary?.testForm?.savedSuccessfully || 'Test order saved successfully!')
        fetchAndPrefillOrders()
      } else {
        setError(dictionary?.testForm?.error || 'Error saving lab test orders')
      }
    } catch {
      setError(dictionary?.testForm?.error || 'Error saving lab test orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {success && (
              <Alert severity='success' sx={{ mb: 4 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
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
                    label={dictionary?.testForm?.selectTest || 'Select Test'}
                    placeholder={dictionary?.testForm?.selectTest || 'Select Test'}
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
                      <ListItemText primary={test.name} secondary={test.category} />
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label={dictionary?.testForm?.result || 'Result'}
                            value={testDetails[test.id]?.result_value || ''}
                            onChange={e => handleDetailChange(test.id, 'result_value', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            label={dictionary?.testForm?.unit || 'Unit'}
                            value={testDetails[test.id]?.result_unit || ''}
                            onChange={e => handleDetailChange(test.id, 'result_unit', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label={dictionary?.testForm?.referenceRange || 'Reference Range'}
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
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type='button'
                  variant='outlined'
                  color='secondary'
                  onClick={fetchAndPrefillOrders}
                  disabled={loading}
                >
                  {dictionary?.navigation?.cancel || 'Cancel'}
                </Button>
                <Button type='submit' variant='contained' color='primary' disabled={loading}>
                  {loading ? dictionary?.testForm?.saving || 'Saving...' : submitButtonText}
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
