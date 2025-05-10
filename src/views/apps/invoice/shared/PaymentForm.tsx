import { useState } from 'react'
import type { FormEvent } from 'react'

import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'
import { useTranslation } from '@/contexts/translationContext'

type PaymentFormProps = {
  invoiceBalance: number
  onSubmit: (data: PaymentFormData) => void
  invoice?: any
  payments?: any[]
}

export type PaymentFormData = {
  paymentDate: Date
  paymentMethod: string
  paymentAmount: number
  paymentNote: string
}

const initialData: PaymentFormData = {
  paymentDate: new Date(),
  paymentMethod: 'select-method',
  paymentAmount: 0,
  paymentNote: ''
}

const PaymentForm = ({ invoiceBalance, onSubmit }: PaymentFormProps) => {
  const [formData, setFormData] = useState<PaymentFormData>(initialData)
  const t = useTranslation()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData(initialData)
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      <Typography variant='h6'>{t.invoice?.addPayment || 'Add Payment'}</Typography>
      <Divider />
      <CustomTextField
        fullWidth
        id='invoice-balance'
        label={t.invoice?.balance || 'Invoice Balance'}
        slotProps={{ input: { disabled: true } }}
        value={(invoiceBalance ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
      />
      <CustomTextField
        fullWidth
        id='payment-amount'
        label={t.invoice?.paymentAmount || 'Payment Amount'}
        type='number'
        value={formData.paymentAmount}
        onChange={e => setFormData({ ...formData, paymentAmount: +e.target.value })}
      />
      <AppReactDatepicker
        selected={formData.paymentDate}
        id='payment-date'
        onChange={(date: Date | null) => date !== null && setFormData({ ...formData, paymentDate: date })}
        customInput={<CustomTextField fullWidth label={t.invoice?.paymentDate || 'Payment Date'} />}
      />
      <CustomTextField
        select
        label={t.invoice?.paymentMethod || 'Payment Method'}
        id='payment-method-select'
        value={formData.paymentMethod}
        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as string })}
      >
        <MenuItem value='select-method' disabled>
          {t.invoice?.selectPaymentMethod || 'Select Payment Method'}
        </MenuItem>
        <MenuItem value='cash'>{t.invoice?.cash || 'Cash'}</MenuItem>
        <MenuItem value='bank-transfer'>{t.invoice?.bankTransfer || 'Bank Transfer'}</MenuItem>
        <MenuItem value='credit'>{t.invoice?.credit || 'Credit'}</MenuItem>
        <MenuItem value='debit'>{t.invoice?.debit || 'Debit'}</MenuItem>
        <MenuItem value='paypal'>{t.invoice?.paypal || 'Paypal'}</MenuItem>
      </CustomTextField>
      <CustomTextField
        rows={4}
        multiline
        fullWidth
        label={t.invoice?.internalPaymentNote || 'Internal Payment Note'}
        placeholder={t.invoice?.internalPaymentNote || 'Internal Payment Note'}
        value={formData.paymentNote}
        onChange={e => setFormData({ ...formData, paymentNote: e.target.value })}
      />
      <div className='flex items-center gap-4'>
        <Button variant='contained' type='submit'>
          {t.invoice?.addPayment || 'Add Payment'}
        </Button>
      </div>
    </form>
  )
}

export default PaymentForm
