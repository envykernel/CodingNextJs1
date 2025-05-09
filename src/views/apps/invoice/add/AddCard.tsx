'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

import { useTranslation } from '@/contexts/translationContext'

// Type Imports
import type { InvoiceType } from '@/types/apps/invoiceTypes'
import type { FormDataType } from './AddCustomerDrawer'

// Component Imports
import AddCustomerDrawer, { initialFormData } from './AddCustomerDrawer'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const AddAction = ({ invoiceData }: { invoiceData?: InvoiceType[] }) => {
  // States
  const [open, setOpen] = useState(false)
  const [selectData, setSelectData] = useState<InvoiceType | null>(null)
  const [issuedDate, setIssuedDate] = useState<Date | null | undefined>(null)
  const [dueDate, setDueDate] = useState<Date | null | undefined>(null)
  const [formData, setFormData] = useState<FormDataType>(initialFormData)
  const t = useTranslation()

  console.log('TRANSLATION DICTIONARY:', t)
  const [services, setServices] = useState<any[]>([])

  const [items, setItems] = useState([{ service_id: '', description: '', quantity: 1, unit_price: 0, line_total: 0 }])

  // Hooks
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

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

  const onFormSubmit = (data: FormDataType) => {
    setFormData(data)
  }

  if (!t || !t.invoice) {
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
                        value={invoiceData?.[0].id}
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
                        Date Issued:
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
                    <div className='flex items-center'>
                      <Typography className='min-is-[95px] mie-4' color='text.primary'>
                        Date Due:
                      </Typography>
                      <AppReactDatepicker
                        boxProps={{ className: 'is-full' }}
                        selected={dueDate}
                        placeholderText='YYYY-MM-DD'
                        dateFormat={'yyyy-MM-dd'}
                        onChange={(date: Date | null) => setDueDate(date)}
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
                  <Typography className='font-medium' color='text.primary'>
                    Invoice To:
                  </Typography>
                  <CustomTextField
                    select
                    className={classnames('min-is-[220px]', { 'is-1/2': isBelowSmScreen })}
                    value={selectData?.id || ''}
                    onChange={e => {
                      setFormData({} as FormDataType)
                      setSelectData(invoiceData?.slice(0, 5).filter(item => item.id === e.target.value)[0] || null)
                    }}
                  >
                    <MenuItem
                      className='flex items-center gap-2 !text-success !bg-transparent hover:text-success hover:!bg-[var(--mui-palette-success-lightOpacity)]'
                      value=''
                      onClick={() => {
                        setSelectData(null)
                        setOpen(true)
                      }}
                    >
                      <i className='tabler-plus text-base' />
                      Add New Customer
                    </MenuItem>
                    {invoiceData?.slice(0, 5).map((invoice: InvoiceType, index) => (
                      <MenuItem key={index} value={invoice.id}>
                        {invoice.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                  {selectData?.id ? (
                    <div>
                      <Typography>{selectData?.name}</Typography>
                      <Typography>{selectData?.company}</Typography>
                      <Typography>{selectData?.address}</Typography>
                      <Typography>{selectData?.contact}</Typography>
                      <Typography>{selectData?.companyEmail}</Typography>
                    </div>
                  ) : (
                    <div>
                      <Typography>{formData?.name}</Typography>
                      <Typography>{formData?.company}</Typography>
                      <Typography>{formData?.address}</Typography>
                      <Typography>{formData?.contactNumber}</Typography>
                      <Typography>{formData?.email}</Typography>
                    </div>
                  )}
                </div>
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Bill To:
                  </Typography>
                  <div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>Total Due:</Typography>
                      <Typography>$12,110.55</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>Bank name:</Typography>
                      <Typography>American Bank</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>Country:</Typography>
                      <Typography>United States</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>IBAN:</Typography>
                      <Typography>ETD95476213874685</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>SWIFT code:</Typography>
                      <Typography>BR91905</Typography>
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
                      <CustomTextField
                        select
                        fullWidth
                        value={item.service_id}
                        onChange={e => updateItem(idx, 'service_id', e.target.value)}
                        className='mbe-5'
                      >
                        <MenuItem value=''>{t.invoice.selectService}</MenuItem>
                        {services.map(service => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.name}
                          </MenuItem>
                        ))}
                      </CustomTextField>
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
                        {item.line_total.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}
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
              <div className='flex justify-between flex-col gap-4 sm:flex-row'>
                <div className='flex flex-col gap-4 order-2 sm:order-[unset]'>
                  <div className='flex items-center gap-2'>
                    <Typography className='font-medium' color='text.primary'>
                      Salesperson:
                    </Typography>
                    <CustomTextField defaultValue='Tommy Shelby' />
                  </div>
                  <CustomTextField placeholder='Thanks for your business' />
                </div>
                <div className='min-is-[200px]'>
                  <div className='flex items-center justify-between'>
                    <Typography>Total:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      {invoiceTotal.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <InputLabel htmlFor='invoice-note' className='inline-flex mbe-1 text-textPrimary'>
                Note:
              </InputLabel>
              <CustomTextField
                id='invoice-note'
                rows={2}
                fullWidth
                multiline
                className='border rounded'
                defaultValue='It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance
              projects. Thank You!'
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <AddCustomerDrawer open={open} setOpen={setOpen} onFormSubmit={onFormSubmit} />
    </>
  )
}

export default AddAction
