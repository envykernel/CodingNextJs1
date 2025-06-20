'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import SendInvoiceDrawer from '@views/apps/invoice/shared/SendInvoiceDrawer'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AddActions = () => {
  // States
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)

  // Hooks
  const params = useParams<{ lang: string }>()
  const locale = (params?.lang as Locale) || 'fr'

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <Button
              fullWidth
              variant='contained'
              className='capitalize'
              startIcon={<i className='tabler-send' />}
              onClick={() => setSendDrawerOpen(true)}
            >
              Send Invoice
            </Button>
            <Button
              fullWidth
              component={Link}
              color='secondary'
              variant='tonal'
              className='capitalize'
              href={getLocalizedUrl('/apps/invoice/preview/4987', locale as Locale)}
            >
              Preview
            </Button>
            <Button fullWidth color='secondary' variant='tonal' className='capitalize'>
              Save
            </Button>
          </CardContent>
        </Card>
        <SendInvoiceDrawer open={sendDrawerOpen} handleClose={() => setSendDrawerOpen(false)} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CustomTextField select fullWidth defaultValue='Internet Banking' label='Accept payments via'>
          <MenuItem value='Internet Banking'>Internet Banking</MenuItem>
          <MenuItem value='Debit Card'>Debit Card</MenuItem>
          <MenuItem value='Credit Card'>Credit Card</MenuItem>
          <MenuItem value='Paypal'>Paypal</MenuItem>
          <MenuItem value='UPI Transfer'>UPI Transfer</MenuItem>
        </CustomTextField>
        <div className='flex items-center justify-between mbs-3'>
          <InputLabel htmlFor='invoice-edit-payment-terms' className='cursor-pointer'>
            Payment Terms
          </InputLabel>
          <Switch defaultChecked id='invoice-edit-payment-terms' />
        </div>
        <div className='flex items-center justify-between'>
          <InputLabel htmlFor='invoice-edit-client-notes' className='cursor-pointer'>
            Client Notes
          </InputLabel>
          <Switch id='invoice-edit-client-notes' />
        </div>
        <div className='flex items-center justify-between'>
          <InputLabel htmlFor='invoice-edit-payment-stub' className='cursor-pointer'>
            Payment Stub
          </InputLabel>
          <Switch id='invoice-edit-payment-stub' />
        </div>
      </Grid>
    </Grid>
  )
}

export default AddActions
