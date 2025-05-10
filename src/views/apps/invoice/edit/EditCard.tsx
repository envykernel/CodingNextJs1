'use client'

import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import Alert from '@mui/material/Alert'
import classnames from 'classnames'

import { useTranslation } from '@/contexts/translationContext'
import AddCustomerDrawer from '../add/AddCustomerDrawer'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const EditCard = ({ invoiceId }: { invoiceId: string }) => {
  // States
  const [open, setOpen] = useState(false)
  const [issuedDate, setIssuedDate] = useState<Date | null | undefined>(null)
  const t = useTranslation()
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [items, setItems] = useState([{ service_id: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }])
  const [visit, setVisit] = useState<any>(null)
  const [visitError, setVisitError] = useState<string | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(true)

  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  // Fetch invoice data
  useEffect(() => {
    if (!invoiceId) {
      setVisitError('Missing invoiceId in URL')
      setInvoiceLoading(false)

      return
    }

    setInvoiceLoading(true)
    fetch(`/api/apps/invoice?id=${invoiceId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setInvoiceNumber(data.invoice_number || '')
          setIssuedDate(data.invoice_date ? new Date(data.invoice_date) : new Date())
          setVisit(data.visit || null)

          // Map lines to items
          if (Array.isArray(data.lines)) {
            setItems(
              data.lines.map((line: any) => ({
                service_id: line.service_id,
                description: line.description || '',
                quantity: line.quantity,
                unit_price: Number(line.unit_price),
                line_total: Number(line.line_total)
              }))
            )
          }

          setVisitError(null)
        } else {
          setVisitError('Invoice not found')
        }

        setInvoiceLoading(false)
      })
      .catch(() => {
        setVisitError('Error fetching invoice')
        setInvoiceLoading(false)
      })
  }, [invoiceId])

  // Fetch services
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices)
  }, [])

  // Helper to update an item
  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => {
      const updated = [...prev]
      const item = { ...updated[idx], [field]: value }

      if (field === 'service_id') {
        const service = services.find(s => s.id === value)

        item.unit_price = service ? Number(service.amount) : 0
      }

      if (field === 'quantity' || field === 'service_id') {
        item.line_total = (item.unit_price || 0) * (item.quantity || 0)
      }

      updated[idx] = item

      return updated
    })
  }

  const addItem = () => {
    setItems(prev => [...prev, { service_id: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }])
  }

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const invoiceTotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0)

  const handleSubmitInvoice = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    const payload = {
      invoice_number: invoiceNumber,
      organisation_id: visit?.organisation_id,
      patient_id: visit?.patient?.id || visit?.patient_id,
      visit_id: visit?.id,
      due_date: null, // or remove if not needed
      lines: items,
      id: invoiceId // Pass the invoice ID for update
    }

    try {
      const res = await fetch(`/api/apps/invoice`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(t.invoice?.error || 'Error updating invoice!')
      }
    } catch (e) {
      setError(t.invoice?.error || 'Error updating invoice!')
    } finally {
      setLoading(false)
    }
  }

  if (!invoiceId) {
    return <div style={{ color: 'red', padding: 32 }}>Missing invoiceId in URL</div>
  }

  if (invoiceLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </div>
    )
  }

  if (visitError) {
    return <div style={{ color: 'red', padding: 32 }}>{visitError}</div>
  }

  if (!t || !t.invoice) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </div>
    )
  }

  if (!invoiceNumber) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardContent className='sm:!p-12'>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <div className='p-6 bg-actionHover rounded'>
                <div className='flex justify-between gap-4 flex-col sm:flex-row'>
                  <div className='flex flex-col gap-6'>
                    <div className='flex items-center gap-2.5'>
                      <Logo />
                    </div>
                    <div>
                      <Typography color='text.primary'>Office 149, 450 South Brand Brooklyn</Typography>
                      <Typography color='text.primary'>San Diego County, CA 91905, USA</Typography>
                      <Typography color='text.primary'>+1 (123) 456 7891, +44 (876) 543 2198</Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-4'>
                      <Typography variant='h5' className='min-is-[95px]'>
                        Invoice
                      </Typography>
                      <CustomTextField
                        fullWidth
                        value={invoiceNumber}
                        slotProps={{
                          input: {
                            disabled: true,
                            startAdornment: <InputAdornment position='start'>#</InputAdornment>
                          }
                        }}
                      />
                    </div>
                    <div className='flex items-center'>
                      <Typography className='min-is-[95px] mie-4' color='text.primary'>
                        {t.invoice.date || 'Date:'}
                      </Typography>
                      <AppReactDatepicker
                        boxProps={{ className: 'is-full' }}
                        selected={issuedDate}
                        placeholderText='YYYY-MM-DD'
                        dateFormat={'yyyy-MM-dd'}
                        onChange={(date: Date | null) => setIssuedDate(date)}
                        customInput={<CustomTextField fullWidth />}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <div className='flex justify-between flex-col gap-4 flex-wrap sm:flex-row'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center gap-2'>
                    <Typography className='font-medium' color='text.primary'>
                      Invoice To:
                    </Typography>
                    <Typography color='text.primary'>{visit?.patient?.name || '-'}</Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <Typography className='font-medium' color='text.primary'>
                        Visit Date:
                      </Typography>
                      <Typography color='text.secondary'>
                        {visit?.start_time ? new Date(visit.start_time).toLocaleString('en-US') : '-'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={classnames('repeater-item flex relative mbe-4 border rounded', {
                    'mbs-8': !isBelowSmScreen,
                    '!mbs-14': idx !== 0 && !isBelowSmScreen,
                    'gap-5': isBelowSmScreen
                  })}
                >
                  <Grid container spacing={5} className='m-0 p-5'>
                    <Grid size={{ xs: 12, md: 5, lg: 6 }}>
                      <Typography className='font-medium md:absolute md:-top-8' color='text.primary'>
                        {t.invoice.item}
                      </Typography>
                      <Autocomplete
                        fullWidth
                        options={services}
                        getOptionLabel={option => option?.name || ''}
                        value={services.find(s => s.id === item.service_id) || null}
                        onChange={(_, newValue) => {
                          updateItem(idx, 'service_id', newValue ? newValue.id : '')
                        }}
                        renderInput={params => (
                          <CustomTextField {...params} placeholder={t.invoice.selectService} className='mbe-5' />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                      />
                      <CustomTextField
                        rows={2}
                        fullWidth
                        multiline
                        value={item.description}
                        onChange={e => updateItem(idx, 'description', e.target.value)}
                        placeholder={t.invoice.itemDescription}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3, lg: 2 }}>
                      <Typography className='font-medium md:absolute md:-top-8'>{t.invoice.unitPrice}</Typography>
                      <CustomTextField fullWidth type='number' value={item.unit_price} disabled className='mbe-5' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Typography className='font-medium md:absolute md:-top-8'>{t.invoice.quantity}</Typography>
                      <CustomTextField
                        fullWidth
                        type='number'
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Typography className='font-medium md:absolute md:-top-8'>{t.invoice.lineTotal}</Typography>
                      <Typography>
                        {item.line_total.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                      </Typography>
                    </Grid>
                  </Grid>
                  <div className='flex flex-col justify-start border-is'>
                    <IconButton size='small' onClick={() => removeItem(idx)}>
                      <i className='tabler-x text-2xl text-actionActive' />
                    </IconButton>
                  </div>
                </div>
              ))}
              <Grid size={{ xs: 12 }}>
                <Button size='small' variant='contained' onClick={addItem} startIcon={<i className='tabler-plus' />}>
                  {t.invoice.addItem}
                </Button>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <div className='flex justify-end w-full'>
                <div className='min-is-[200px] flex items-center justify-between'>
                  <Typography>Total:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    {invoiceTotal.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                  </Typography>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='border-dashed' />
            </Grid>
            {success && (
              <Alert severity='success' sx={{ mb: 4 }}>
                {t.invoice?.confirmation || 'Invoice updated successfully!'}
              </Alert>
            )}
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
            <Grid size={{ xs: 12 }}>
              <Button variant='contained' color='primary' onClick={handleSubmitInvoice} disabled={loading}>
                {loading ? t.invoice?.saving || 'Saving...' : t.invoice?.updateInvoice || 'Update Invoice'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <AddCustomerDrawer open={open} setOpen={setOpen} />
    </>
  )
}

export default EditCard
