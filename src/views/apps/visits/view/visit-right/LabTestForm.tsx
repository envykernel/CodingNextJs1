'use client'

import React, { useState, useEffect } from 'react'

import { TextField, Button, Grid, Card, CardContent, Typography, IconButton, Autocomplete } from '@mui/material'
import Alert from '@mui/material/Alert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

interface LabTestFormProps {
  visitId: number
  dictionary: any
  initialValues?: any
  onUpdate?: (updatedVisit: any) => void
}

interface LabTest {
  id?: number
  test_type_id: number
  test_type?: {
    id: number
    name: string
    category: string
    unit?: string
    reference_range?: string
  }
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  result?: string
  notes?: string
}

const initialState = {
  tests: [] as LabTest[],
  notes: ''
}

const LabTestForm: React.FC<LabTestFormProps> = ({ visitId, dictionary, initialValues, onUpdate }) => {
  const t = dictionary?.labTestForm || {}

  const [form, setForm] = useState(() => {
    if (initialValues) {
      return {
        tests:
          initialValues.map((test: any) => ({
            id: test.id,
            test_type_id: test.test_type_id,
            test_type: test.test_type,
            status: test.status,
            result: test.result || '',
            notes: test.notes || ''
          })) || [],
        notes: ''
      }
    }

    return initialState
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testTypes, setTestTypes] = useState<any[]>([])

  useEffect(() => {
    // Fetch test types
    fetch('/api/lab-test-types')
      .then(res => res.json())
      .then(data => setTestTypes(data))
      .catch(err => console.error('Error fetching test types:', err))
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000)

      return () => clearTimeout(timer)
    }
  }, [success])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleTestChange = (index: number, field: keyof LabTest, value: any) => {
    const newTests = [...form.tests]

    newTests[index] = { ...newTests[index], [field]: value }
    setForm({ ...form, tests: newTests })
  }

  const addTest = () => {
    setForm({
      ...form,
      tests: [...form.tests, { test_type_id: 0, status: 'pending', result: '', notes: '' }]
    })
  }

  const removeTest = (index: number) => {
    const newTests = form.tests.filter((_: LabTest, i: number) => i !== index)

    setForm({ ...form, tests: newTests })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/lab-test-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_id: visitId,
          tests: form.tests,
          notes: form.notes
        })
      })

      if (res.ok) {
        const data = await res.json()

        setSuccess(true)

        if (onUpdate) {
          onUpdate(data.visit)
        }
      } else {
        const data = await res.json()

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
        {success && (
          <Alert icon={<CheckCircleIcon fontSize='inherit' />} severity='success' sx={{ mb: 2 }}>
            {t.savedSuccessfully || 'Lab tests saved successfully'}
          </Alert>
        )}
        <Typography variant='h6' className='mb-4'>
          {t.title || 'Lab Tests'}
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='mb-4'>
            <Button variant='outlined' color='primary' startIcon={<AddIcon />} onClick={addTest} className='mb-4'>
              {t.addTest || 'Add Test'}
            </Button>
            {form.tests.map((test: LabTest, index: number) => (
              <Card key={index} className='mb-4 p-4' variant='outlined'>
                <Grid container spacing={2}>
                  <Grid item xs={11}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Autocomplete
                          options={testTypes}
                          getOptionLabel={option => option.name}
                          value={testTypes.find(t => t.id === test.test_type_id) || null}
                          onChange={(_, newValue) => {
                            handleTestChange(index, 'test_type_id', newValue?.id || 0)
                            handleTestChange(index, 'test_type', newValue || null)
                          }}
                          renderInput={params => <TextField {...params} label={t.testType || 'Test Type'} required />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label={t.status || 'Status'}
                          value={test.status}
                          onChange={e => handleTestChange(index, 'status', e.target.value)}
                          fullWidth
                          required
                          SelectProps={{
                            native: true
                          }}
                        >
                          <option value='pending'>{t.pending || 'Pending'}</option>
                          <option value='in_progress'>{t.inProgress || 'In Progress'}</option>
                          <option value='completed'>{t.completed || 'Completed'}</option>
                          <option value='cancelled'>{t.cancelled || 'Cancelled'}</option>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={t.result || 'Result'}
                          value={test.result}
                          onChange={e => handleTestChange(index, 'result', e.target.value)}
                          fullWidth
                          disabled={test.status !== 'completed'}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label={t.notes || 'Notes'}
                          value={test.notes}
                          onChange={e => handleTestChange(index, 'notes', e.target.value)}
                          fullWidth
                          multiline
                          minRows={2}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color='error' onClick={() => removeTest(index)} className='mt-2' size='small'>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </div>
          <TextField
            label={t.notes || 'Additional Notes'}
            name='notes'
            value={form.notes}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
          <div className='flex gap-4 mt-4'>
            <Button type='submit' variant='contained' color='primary' disabled={loading}>
              {loading ? t.saving || 'Saving...' : t.save || 'Save'}
            </Button>
            {error && (
              <Typography color='error.main' sx={{ ml: 2 }}>
                {error}
              </Typography>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default LabTestForm
