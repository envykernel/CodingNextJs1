// React Imports
import { useState, useEffect } from 'react'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { PatientType } from './PatientListTable'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useTranslation } from '@/contexts/translationContext'

const PatientTableFilters = ({
  setData,
  tableData
}: {
  setData: (data: PatientType[]) => void
  tableData?: PatientType[]
}) => {
  // States
  const [gender, setGender] = useState('')
  const [status, setStatus] = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  // Initialize name search from URL params
  useEffect(() => {
    const nameParam = searchParams?.get('name') || ''
    setNameSearch(nameParam)
  }, [searchParams])

  useEffect(() => {
    // Only filter by gender and status client-side
    const filteredData = tableData?.filter(patient => {
      if (gender && patient.gender !== gender) return false
      if (status && patient.status !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [gender, status, tableData, setData])

  const handleNameSearch = () => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    if (nameSearch) {
      params.set('name', nameSearch)
    } else {
      params.delete('name')
    }
    params.set('page', '1') // reset to first page on search
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleNameSearch()
    }
  }

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-gender'
            value={gender}
            onChange={e => setGender(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>{t('form.selectGender')}</MenuItem>
            <MenuItem value='male'>{t('form.male')}</MenuItem>
            <MenuItem value='female'>{t('form.female')}</MenuItem>
            <MenuItem value='other'>{t('form.other')}</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            id='filter-name'
            value={nameSearch}
            onChange={e => setNameSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('patient.name')}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={handleNameSearch} edge='end' aria-label='search'>
                    <i className='tabler-search' />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>{t('form.selectStatus')}</MenuItem>
            <MenuItem value='enabled'>{t('form.enabled')}</MenuItem>
            <MenuItem value='disabled'>{t('form.disabled')}</MenuItem>
            <MenuItem value='blocked'>{t('form.blocked')}</MenuItem>
            <MenuItem value='pending'>{t('form.pending')}</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default PatientTableFilters
