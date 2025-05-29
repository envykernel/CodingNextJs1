'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

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
import classnames from 'classnames'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'

import { useTranslation } from '@/contexts/translationContext'
import AddCustomerDrawer from '../add/AddCustomerDrawer'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

type EditCardProps = { invoice: any; refreshInvoice?: () => void }

const EditCard = ({ invoice }: EditCardProps) => {
  // States
  const [open, setOpen] = useState(false)

  const [issuedDate] = useState<Date | null | undefined>(
    invoice?.invoice_date ? new Date(invoice.invoice_date) : new Date()
  )

  const { t } = useTranslation()
  const [invoiceNumber] = useState(invoice?.invoice_number || '')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<any[]>([])

  const [items, setItems] = useState(
    Array.isArray(invoice?.lines)
      ? invoice.lines.map((line: any) => ({
          id: line.id,
          service_id: line.service_id,
          description: line.description || '',
          quantity: line.quantity,
          unit_price: Number(line.unit_price),
          line_total: Number(line.line_total)
        }))
      : [{ service_id: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }]
  )

  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const router = useRouter()

  // Fetch services
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices)
  }, [])

  // Helper to update an item
  const updateItem = (idx: number, field: string, value: any) => {
    setItems((prev: any[]) => {
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
    setItems((prev: any[]) => [...prev, { service_id: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }])
  }

  const removeItem = (idx: number) => {
    setItems((prev: any[]) => prev.filter((_: any, i: number) => i !== idx))
  }

  const invoiceTotal = items.reduce((sum: number, item: any) => sum + (item.line_total || 0), 0)

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    const currency = invoice?.organisation?.currency || 'MAD'

    return amount.toLocaleString('en-US', { style: 'currency', currency })
  }

  const handleSubmitInvoice = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    const payload = {
      invoice_number: invoiceNumber,
      organisation_id: invoice?.organisation_id,
      patient_id: invoice?.patient_id,
      visit_id: invoice?.visit_id,
      due_date: null, // or remove if not needed
      lines: items,
      id: invoice?.id // Pass the invoice ID for update
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
        setError(t('invoice.error') || 'Error updating invoice!')
      }
    } catch (e) {
      setError(t('invoice.error') || 'Error updating invoice!')
    } finally {
      setLoading(false)
    }
  }

  if (!invoice?.id) {
    return <div style={{ color: 'red', padding: 32 }}>Missing invoiceId in URL</div>
  }

  if (!t) {
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
                    {invoice?.organisation && (
                      <div>
                        <Typography color='text.primary' fontWeight={600}>
                          {invoice.organisation.name}
                        </Typography>
                        {invoice.organisation.address && (
                          <Typography color='text.primary'>{invoice.organisation.address}</Typography>
                        )}
                        {invoice.organisation.phone_number && (
                          <Typography color='text.primary'>{invoice.organisation.phone_number}</Typography>
                        )}
                        {invoice.organisation.email && (
                          <Typography color='text.primary'>{invoice.organisation.email}</Typography>
                        )}
                      </div>
                    )}
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
                        {t('invoice.date') || 'Date:'}
                      </Typography>
                      <AppReactDatepicker
                        boxProps={{ className: 'is-full' }}
                        selected={issuedDate}
                        placeholderText='YYYY-MM-DD'
                        dateFormat={'yyyy-MM-dd'}
                        onChange={() => {}}
                        disabled
                        customInput={<CustomTextField fullWidth disabled />}
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
                    <Typography color='text.primary'>{invoice?.patient?.name || '-'}</Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <Typography className='font-medium' color='text.primary'>
                        Visit Date:
                      </Typography>
                      <Typography color='text.secondary'>
                        {invoice?.visit?.start_time ? new Date(invoice.visit.start_time).toLocaleString('en-US') : '-'}
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
              {items.map((item: any, idx: number) => {
                const hasPayments = Array.isArray(invoice?.payment_apps)
                  ? invoice.payment_apps.some((pa: any) => pa.invoice_line_id === item.id)
                  : false

                return (
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
                          {t('invoice.item')}
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
                            <CustomTextField {...params} placeholder={t('invoice.selectService')} className='mbe-5' />
                          )}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                        <CustomTextField
                          rows={2}
                          fullWidth
                          multiline
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          placeholder={t('invoice.itemDescription')}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3, lg: 2 }}>
                        <Typography className='font-medium md:absolute md:-top-8'>{t('invoice.unitPrice')}</Typography>
                        <CustomTextField fullWidth type='number' value={item.unit_price} disabled className='mbe-5' />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Typography className='font-medium md:absolute md:-top-8'>{t('invoice.quantity')}</Typography>
                        <CustomTextField
                          fullWidth
                          type='number'
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Typography className='font-medium md:absolute md:-top-8'>{t('invoice.lineTotal')}</Typography>
                        <Typography>{formatCurrency(item.line_total)}</Typography>
                      </Grid>
                    </Grid>
                    <div className='flex flex-col justify-start border-is'>
                      {!hasPayments ? (
                        <IconButton size='small' onClick={() => removeItem(idx)}>
                          <i className='tabler-x text-2xl text-actionActive' />
                        </IconButton>
                      ) : (
                        <Tooltip
                          title={
                            t('invoice.cannotDeleteItemWithPayments') ||
                            'Cannot delete invoice items with payments applied. Please delete all payments linked to this item before deleting it.'
                          }
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', margin: 4 }}>
                            <i
                              className='tabler-lock text-2xl text-gray-400'
                              style={{ cursor: 'not-allowed', padding: 8, margin: 0 }}
                            />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )
              })}
              <Grid size={{ xs: 12 }}>
                <Button size='small' variant='contained' onClick={addItem} startIcon={<i className='tabler-plus' />}>
                  {t('invoice.addItem')}
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
                    {formatCurrency(invoiceTotal)}
                  </Typography>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <div className='flex flex-row items-center gap-4'>
                <Button variant='contained' color='primary' onClick={handleSubmitInvoice} disabled={loading}>
                  {loading ? t('invoice.saving') || 'Saving...' : t('invoice.updateInvoice') || 'Update Invoice'}
                </Button>
                <Button variant='outlined' color='secondary' onClick={() => router.push('/fr/apps/invoice/list')}>
                  {t('invoice.cancel') || 'Cancel'}
                </Button>
                {success && (
                  <Alert severity='success' sx={{ m: 0, p: '4px 16px' }}>
                    {t('invoice.confirmation') || 'Invoice updated successfully!'}
                  </Alert>
                )}
                {error && (
                  <Alert severity='error' sx={{ m: 0, p: '4px 16px' }}>
                    {error}
                  </Alert>
                )}
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <AddCustomerDrawer open={open} setOpen={setOpen} />
    </>
  )
}

export default EditCard
