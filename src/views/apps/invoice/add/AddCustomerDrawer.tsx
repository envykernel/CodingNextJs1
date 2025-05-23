// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onPatientCreated?: (newPatient: any) => void
}

export type FormDataType = {
  name: string
  company: string
  email: string
  address: string
  country: string
  contactNumber: string
}

// Vars
export const initialFormData: FormDataType = {
  name: '',
  company: '',
  email: '',
  address: '',
  country: 'USA',
  contactNumber: ''
}

const countries = ['USA', 'UK', 'Russia', 'Australia', 'Canada']

const AddCustomerDrawer = ({ open, setOpen, onPatientCreated }: Props) => {
  // States
  const [data, setData] = useState<FormDataType>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone_number: data.contactNumber,
          address: data.address,
          city: data.country,
          status: 'active'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create patient')
      }

      const newPatient = await response.json()

      onPatientCreated?.(newPatient)
      setOpen(false)
      handleReset()
    } catch (err) {
      setError('Failed to create patient. Please try again.')
      console.error('Error creating patient:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setOpen(false)
    setData(initialFormData)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Add New Patient</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        <form onSubmit={e => handleSubmit(e)} className='flex flex-col gap-5'>
          <CustomTextField
            fullWidth
            id='name'
            label='Name'
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
          />
          <CustomTextField
            fullWidth
            id='company'
            label='Company'
            value={data.company}
            onChange={e => setData({ ...data, company: e.target.value })}
          />
          <CustomTextField
            fullWidth
            id='email'
            label='Email'
            value={data.email}
            onChange={e => setData({ ...data, email: e.target.value })}
          />
          <CustomTextField
            rows={6}
            multiline
            fullWidth
            id='address'
            label='Address'
            value={data.address}
            onChange={e => setData({ ...data, address: e.target.value })}
          />
          <CustomTextField
            select
            id='country'
            label='Country'
            name='country'
            variant='outlined'
            value={data?.country?.toLowerCase().replace(/\s+/g, '-') || ''}
            onChange={e => setData({ ...data, country: e.target.value })}
          >
            {countries.map((item, index) => (
              <MenuItem key={index} value={item.toLowerCase().replace(/\s+/g, '-')}>
                {item}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            fullWidth
            id='contact'
            type='number'
            label='Contact Number'
            value={data.contactNumber}
            onChange={e => setData({ ...data, contactNumber: e.target.value })}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? 'Adding...' : 'Add Patient'}
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={handleReset} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddCustomerDrawer
