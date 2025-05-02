// React Imports
import { useState, useEffect } from 'react'

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
  const [doctor, setDoctor] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(patient => {
      if (gender && patient.gender !== gender) return false
      if (doctor && patient.doctor !== doctor) return false
      if (status && patient.status !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [gender, doctor, status, tableData, setData])

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
            id='select-doctor'
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
            placeholder='Doctor'
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
