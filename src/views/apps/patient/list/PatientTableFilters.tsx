// React Imports
import { useState, useEffect } from 'react'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { PatientType } from './PatientListTable'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only filter by gender and status client-side
    const filteredData = tableData?.filter(patient => {
      if (gender && patient.gender !== gender) return false
      if (status && patient.status !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [gender, status, tableData, setData])

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
            <MenuItem value=''>Select Gender</MenuItem>
            <MenuItem value='Male'>Male</MenuItem>
            <MenuItem value='Female'>Female</MenuItem>
            <MenuItem value='Other'>Other</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            id='filter-name'
            defaultValue={searchParams.get('name') || ''}
            onChange={e => {
              const params = new URLSearchParams(searchParams.toString())

              if (e.target.value) {
                params.set('name', e.target.value)
                params.set('page', '1') // reset to first page on filter
              } else {
                params.delete('name')
                params.set('page', '1')
              }

              router.push(`${pathname}?${params.toString()}`)
            }}
            placeholder='Patient Name'
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
            <MenuItem value=''>Select Status</MenuItem>
            <MenuItem value='admitted'>Admitted</MenuItem>
            <MenuItem value='discharged'>Discharged</MenuItem>
            <MenuItem value='critical'>Critical</MenuItem>
            <MenuItem value='underObservation'>Under Observation</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default PatientTableFilters
