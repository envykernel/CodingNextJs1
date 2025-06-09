'use client'

import React, { useState, useEffect } from 'react'

import { Card, CardContent, Button, TextField, Grid, Typography, Alert, IconButton, Autocomplete } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

interface ExamType {
  id: number
  name: string
  category: string | null
  description: string | null
}

interface RadiologyOrder {
  id?: number
  exam_type: {
    id: number
    name: string
    category: string | null
    description: string | null
  }
  notes: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  result: string | null
  result_date: string | null
}

interface RadiologyOrderFormProps {
  visitId: number
  initialValues?: RadiologyOrder[]
  onSuccess?: () => void
}

export default function RadiologyOrderForm({ visitId, initialValues, onSuccess }: RadiologyOrderFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [examTypes, setExamTypes] = useState<ExamType[]>([])

  const [orders, setOrders] = useState<RadiologyOrder[]>(() => {
    if (initialValues && Array.isArray(initialValues) && initialValues.length > 0) {
      return initialValues
    }

    return [
      {
        exam_type: { id: 0, name: '', category: null, description: null },
        notes: '',
        status: 'pending',
        result: null,
        result_date: null
      }
    ]
  })

  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        const response = await fetch('/api/radiology/exam-types')

        if (!response.ok) throw new Error('Failed to fetch exam types')
        const data = await response.json()

        setExamTypes(data)
      } catch (err) {
        setError('Failed to load exam types')
      }
    }

    fetchExamTypes()
  }, [])

  const addOrder = () => {
    setOrders([
      ...orders,
      {
        exam_type: { id: 0, name: '', category: '', description: null },
        notes: '',
        status: 'pending',
        result: null,
        result_date: null
      }
    ])
  }

  const removeOrder = (index: number) => {
    if (orders.length > 1) {
      const newOrders = orders.filter((_, i) => i !== index)

      setOrders(newOrders)
    }
  }

  const handleOrderChange = (index: number, field: keyof RadiologyOrder, value: any) => {
    const newOrders = [...orders]

    if (field === 'exam_type') {
      const selectedExamType = examTypes.find(type => type.id === value.id)

      newOrders[index] = {
        ...newOrders[index],
        exam_type: selectedExamType || { id: 0, name: '', category: null, description: null }
      }
    } else {
      newOrders[index] = { ...newOrders[index], [field]: value }
    }

    setOrders(newOrders)
  }

  const handleExamTypeChange = (index: number, value: ExamType | null) => {
    const newOrders = [...orders]

    newOrders[index] = {
      ...newOrders[index],
      exam_type: value || { id: 0, name: '', category: null, description: null }
    }
    setOrders(newOrders)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const ordersToSubmit = orders.map(order => ({
        exam_type_id: order.exam_type.id,
        notes: order.notes,
        status: order.status,
        result: order.result,
        result_date: order.result_date
      }))

      const response = await fetch(`/api/visits/${visitId}/radiology-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orders: ordersToSubmit })
      })

      if (!response.ok) {
        throw new Error('Failed to save radiology orders')
      }

      await response.json()
      onSuccess?.()
      setSuccess(true)
      setOrders([
        {
          exam_type: { id: 0, name: '', category: null, description: null },
          notes: '',
          status: 'pending',
          result: null,
          result_date: null
        }
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' className='mb-4'>
          Radiology Orders
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='mb-4'>
            <Button variant='outlined' color='primary' startIcon={<AddIcon />} onClick={addOrder} className='mb-4'>
              Add Radiology Order
            </Button>
            {orders.map((order, index) => (
              <Card key={index} className='mb-4 p-4' variant='outlined'>
                <Grid container spacing={2}>
                  <Grid item xs={11}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          options={examTypes}
                          getOptionLabel={option => option.name}
                          value={examTypes.find(type => type.id === order.exam_type.id) || null}
                          onChange={(_, newValue) => handleExamTypeChange(index, newValue)}
                          renderInput={params => <TextField {...params} label='Exam Type' required fullWidth />}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          groupBy={option => option.category || 'Other'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label='Status'
                          value={order.status}
                          onChange={e =>
                            handleOrderChange(
                              index,
                              'status',
                              e.target.value as 'pending' | 'in_progress' | 'completed' | 'cancelled'
                            )
                          }
                          fullWidth
                          select
                          SelectProps={{ native: true }}
                        >
                          <option value='pending'>Pending</option>
                          <option value='in_progress'>In Progress</option>
                          <option value='completed'>Completed</option>
                          <option value='cancelled'>Cancelled</option>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label='Result'
                          value={order.result || ''}
                          onChange={e => handleOrderChange(index, 'result', e.target.value as string | null)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label='Result Date'
                          type='date'
                          value={order.result_date || ''}
                          onChange={e => handleOrderChange(index, 'result_date', e.target.value as string | null)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label='Notes'
                          value={order.notes}
                          onChange={e => handleOrderChange(index, 'notes', e.target.value)}
                          fullWidth
                          multiline
                          minRows={2}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color='error' onClick={() => removeOrder(index)} className='mt-2' size='small'>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </div>
          <div className='flex items-center gap-4 mt-4'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={loading}
              startIcon={loading ? <i className='tabler-loader animate-spin' /> : undefined}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            {success && (
              <Alert icon={<CheckCircleIcon fontSize='inherit' />} severity='success' sx={{ flex: 1 }}>
                Radiology orders saved successfully!
              </Alert>
            )}
            {error && (
              <Alert severity='error' sx={{ flex: 1 }}>
                {error}
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
