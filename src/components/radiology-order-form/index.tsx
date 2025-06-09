'use client'

import React, { useState, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  IconButton,
  Autocomplete,
  Box
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'

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

const convertDateToYYYYMMDD = (dateStr: string | null): string | null => {
  if (!dateStr) return null

  // Check if the date is already in YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr

  // Convert from DD/MM/YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split('/')

  return `${year}-${month}-${day}`
}

export default function RadiologyOrderForm({ visitId, initialValues, onSuccess }: RadiologyOrderFormProps) {
  const params = useParams() as { lang: string }
  const { lang: locale } = params
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [examTypes, setExamTypes] = useState<ExamType[]>([])

  const [orders, setOrders] = useState<RadiologyOrder[]>(() => {
    if (initialValues && Array.isArray(initialValues) && initialValues.length > 0) {
      return initialValues.map(order => ({
        ...order,
        result_date: convertDateToYYYYMMDD(order.result_date)
      }))
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

  const removeOrder = async (index: number) => {
    const orderToRemove = orders[index]

    // If it's an existing order (has an ID), delete it from the database
    if (orderToRemove.id) {
      try {
        const response = await fetch(`/api/radiology/orders?id=${orderToRemove.id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const errorData = await response.json()

          throw new Error(errorData.error || 'Failed to delete radiology order')
        }

        const data = await response.json()

        if (data.visit) {
          onSuccess?.()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete order')

        return // Don't remove from local state if deletion failed
      }
    }

    // Remove from local state if it's a new order or if deletion was successful
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
      // Separate orders into existing and new ones
      const ordersToSubmit = orders.map(order => {
        const isExisting = 'id' in order && order.id

        return {
          id: isExisting ? order.id : undefined,
          exam_type_id: order.exam_type.id,
          notes: order.notes,
          status: order.status,
          result: order.result,
          result_date: order.result_date // This will be in YYYY-MM-DD format
        }
      })

      // First, update existing orders
      const existingOrders = ordersToSubmit.filter(order => order.id)

      if (existingOrders.length > 0) {
        await Promise.all(
          existingOrders.map(order =>
            fetch('/api/radiology/orders', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(order)
            }).then(async response => {
              if (!response.ok) {
                const errorData = await response.json()

                throw new Error(errorData.error || 'Failed to update radiology order')
              }
            })
          )
        )
      }

      // Then, create new orders
      const newOrders = ordersToSubmit.filter(order => !order.id)
      let updatedVisit = null

      if (newOrders.length > 0) {
        const response = await fetch('/api/radiology/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ visit_id: visitId, orders: newOrders })
        })

        if (!response.ok) {
          const errorData = await response.json()

          throw new Error(errorData.error || 'Failed to save new radiology orders')
        }

        const data = await response.json()

        updatedVisit = data.visit
      }

      // If we have updated visit data, use it to update the form
      if (updatedVisit) {
        // Transform the orders to match our form state format
        const updatedOrders = updatedVisit.radiology_orders.map(
          (order: {
            id: number
            exam_type: {
              id: number
              name: string
              category: string | null
              description: string | null
            }
            notes: string | null
            status: string
            result: string | null
            result_date: string | null
          }) => ({
            id: order.id,
            exam_type: {
              id: order.exam_type.id,
              name: order.exam_type.name,
              category: order.exam_type.category,
              description: order.exam_type.description
            },
            notes: order.notes || '',
            status: order.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
            result: order.result,
            result_date: convertDateToYYYYMMDD(order.result_date)
          })
        )

        // If there are no orders, add an empty one
        if (updatedOrders.length === 0) {
          updatedOrders.push({
            exam_type: { id: 0, name: '', category: null, description: null },
            notes: '',
            status: 'pending',
            result: null,
            result_date: null
          })
        }

        setOrders(updatedOrders)
      }

      onSuccess?.()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h6'>Radiology Orders</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant='outlined' color='primary' startIcon={<AddIcon />} onClick={addOrder}>
              Add Radiology Order
            </Button>
            {initialValues && initialValues.length > 0 && initialValues[0].id && (
              <Link
                href={`/${locale}/apps/radiology/print/${initialValues[0].id}`}
                target='_blank'
                rel='noopener'
                passHref
              >
                <Button
                  variant='outlined'
                  startIcon={<PrintIcon />}
                  disabled={orders.length === 0 || (orders.length === 1 && !orders[0].exam_type.name)}
                >
                  Print Orders
                </Button>
              </Link>
            )}
          </Box>
        </Box>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='mb-4'>
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
