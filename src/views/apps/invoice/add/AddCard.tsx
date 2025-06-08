'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useSearchParams, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// Type Imports

// Util Imports

// MUI Imports
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

// Third-party Imports
import classnames from 'classnames'

import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import AddCustomerDrawer from './AddCustomerDrawer'
import CustomTextField from '@core/components/mui/TextField'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const AddAction = () => {
  // States
  const [open, setOpen] = useState(false)
  const [issuedDate, setIssuedDate] = useState<Date | null | undefined>(new Date())
  const { t } = useTranslation()
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedOrganisation, setSelectedOrganisation] = useState<any>(null)

  const [items, setItems] = useState([{ service_id: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }])

  // Hooks
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const searchParams = useSearchParams()
  const visitId = searchParams?.get('visitId')
  const [visit, setVisit] = useState<any>(null)
  const [visitLoading, setVisitLoading] = useState(!!visitId)
  const [visitError, setVisitError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams() as Record<string, string | string[]> | null
  const locale = params && typeof params === 'object' && 'lang' in params ? params['lang'] : 'en'

  // Fetch patients if no visitId
  useEffect(() => {
    if (!visitId) {
      // Fetch patients
      fetch('/api/patients')
        .then(res => res.json())
        .then(data => {
          setPatients(data.patients || [])
        })
        .catch(console.error)

      // Get user's organization from session
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(data => {
          if (data?.user?.organisationId) {
            // Fetch full organization details
            fetch(`/api/organisation/${data.user.organisationId}`)
              .then(orgRes => orgRes.json())
              .then(orgData => {
                setSelectedOrganisation(orgData.organisation)
              })
              .catch(console.error)
          }
        })
        .catch(console.error)
    }
  }, [visitId])

  // Fetch visit data if visitId is provided
  useEffect(() => {
    if (!visitId) {
      setVisitLoading(false)
      return
    }

    setVisitLoading(true)
    setVisitError(null)

    fetch(`/api/visits?id=${visitId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (data.visit) {
          setVisit(data.visit)
          setSelectedPatient(data.visit.patient)
          setSelectedOrganisation(data.visit.organisation)
          setVisitError(null)
        } else {
          setVisitError('Visit not found')
        }
        setVisitLoading(false)
      })
      .catch(error => {
        console.error('Error fetching visit:', error)
        setVisitError('Error fetching visit')
        setVisitLoading(false)
      })
  }, [visitId])

  useEffect(() => {
    fetch('/api/services')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(setServices)
      .catch(error => {
        console.error('Error fetching services:', error)
        setServices([])
      })
  }, [])

  useEffect(() => {
    setInvoiceNumber(`INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`)
  }, [])

  // Auto-add consultation service if visit type is Consultation
  useEffect(() => {
    if (
      visit &&
      services.length > 0 &&
      (visit.type === 'Consultation' || visit.status === 'Consultation') &&
      !items.some(item => {
        const service = services.find(s => s.id === item.service_id)

        return service && service.name.toLowerCase().includes('consultation')
      })
    ) {
      // Find the consultation service
      const consultationService = services.find(s => s.name.toLowerCase().includes('consultation'))

      if (consultationService) {
        setItems(prev => [
          ...prev,
          {
            service_id: consultationService.id,
            description: consultationService.description || '',
            quantity: 1,
            unit_price: Number(consultationService.amount),
            line_total: Number(consultationService.amount)
          }
        ])
      }
    }
  }, [visit, services])

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

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    const currency = selectedOrganisation?.currency || 'MAD'

    return amount.toLocaleString('en-US', { style: 'currency', currency })
  }

  const handleSubmitInvoice = async () => {
    if (!selectedPatient || !selectedOrganisation) {
      setError(t('invoice.errorMissingPatientOrOrg') || 'Please select a patient and organisation')

      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    const payload = {
      invoice_number: invoiceNumber,
      organisation_id: selectedOrganisation.id,
      patient_id: selectedPatient.id,
      visit_id: visit?.id,
      due_date: null,
      lines: items
    }

    try {
      const res = await fetch('/api/apps/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const invoice = await res.json()

        setSuccess(true)

        // Redirect to the invoice preview page
        router.push(`/${locale}/apps/invoice/preview/${invoice.id}`)
      } else {
        setError(t('invoice.error') || 'Error creating invoice!')
      }
    } catch (e) {
      setError(t('invoice.error') || 'Error creating invoice!')
    } finally {
      setLoading(false)
    }
  }

  // Handle patient creation success
  const handlePatientCreated = (newPatient: any) => {
    setPatients(prev => [...prev, newPatient])
    setSelectedPatient(newPatient)
    setOpen(false)
  }

  if (visitLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </div>
    )
  }

  if (visitError) {
    return <div style={{ color: 'red', padding: 32 }}>{visitError}</div>
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
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 9 }}>
        <Card>
          <CardContent className='sm:!p-12'>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <div className='p-6 bg-actionHover rounded'>
                  <div className='flex justify-between gap-4 flex-col sm:flex-row'>
                    <div className='flex flex-col gap-6'>
                      {selectedOrganisation && (
                        <div className='flex flex-col gap-2'>
                          <div className='flex items-center gap-2'>
                            <i className='tabler-building text-lg text-gray-500' />
                            <Typography color='text.primary' fontWeight={600}>
                              {selectedOrganisation.name}
                            </Typography>
                          </div>
                          {selectedOrganisation.address && (
                            <div className='flex items-center gap-2'>
                              <i className='tabler-map-pin text-lg text-gray-500' />
                              <Typography color='text.primary'>{selectedOrganisation.address}</Typography>
                            </div>
                          )}
                          {selectedOrganisation.phone_number && (
                            <div className='flex items-center gap-2'>
                              <i className='tabler-phone text-lg text-gray-500' />
                              <Typography color='text.primary'>{selectedOrganisation.phone_number}</Typography>
                            </div>
                          )}
                          {selectedOrganisation.email && (
                            <div className='flex items-center gap-2'>
                              <i className='tabler-mail text-lg text-gray-500' />
                              <Typography color='text.primary'>{selectedOrganisation.email}</Typography>
                            </div>
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
                          onChange={(date: Date | null) => setIssuedDate(date)}
                          customInput={<CustomTextField fullWidth />}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>

              {/* Patient and Organisation Selection (when no visit) */}
              {!visitId && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-2'>
                      <Autocomplete
                        fullWidth
                        options={patients}
                        getOptionLabel={(option: any) => option?.name || ''}
                        value={selectedPatient}
                        onChange={(_, newValue: any) => {
                          setSelectedPatient(newValue)
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label={t('patient.patientName')}
                            required
                            placeholder={t('patient.searchPlaceholder') || 'Search patient...'}
                          />
                        )}
                        isOptionEqualToValue={(option: any, value: any) => option.id === value?.id}
                      />
                    </div>
                  </div>
                </Grid>
              )}

              {/* Visit Information (when visit exists) */}
              {visit && (
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
                            {t('navigation.visitDetails.date') || 'Visit Date'}:
                          </Typography>
                          <Typography color='text.secondary'>
                            {visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString('en-US') : '-'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </Grid>
              )}

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
                      <IconButton size='small' onClick={() => removeItem(idx)}>
                        <i className='tabler-x text-2xl text-actionActive' />
                      </IconButton>
                    </div>
                  </div>
                ))}
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
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            {success && (
              <Alert severity='success' sx={{ mb: 0 }}>
                {t('invoice.confirmation') || 'Invoice created successfully!'}
              </Alert>
            )}
            {error && (
              <Alert severity='error' sx={{ mb: 0 }}>
                {error}
              </Alert>
            )}
            <Button
              fullWidth
              variant='contained'
              color='primary'
              onClick={handleSubmitInvoice}
              disabled={loading}
              className='capitalize'
              startIcon={<i className='tabler-file-plus' />}
            >
              {loading ? t('invoice.saving') || 'Saving...' : t('invoice.createInvoice') || 'Create Invoice'}
            </Button>
            <Button
              fullWidth
              variant='tonal'
              color='secondary'
              onClick={() => router.back()}
              className='capitalize'
              startIcon={<i className='tabler-x' />}
            >
              {t('invoice.cancelInvoice') || 'Cancel Invoice'}
            </Button>
            <Button
              fullWidth
              component={Link}
              href={getLocalizedUrl('/apps/invoice/list', locale as Locale)}
              variant='tonal'
              color='secondary'
              className='capitalize'
              startIcon={<i className='tabler-list' />}
            >
              {t('invoice.list') || 'Invoice List'}
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <AddCustomerDrawer open={open} setOpen={setOpen} onPatientCreated={handlePatientCreated} />
    </Grid>
  )
}

export default AddAction
