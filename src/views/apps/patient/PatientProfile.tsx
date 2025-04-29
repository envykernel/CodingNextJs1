'use client'

import { useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Grid,
  MenuItem,
  InputAdornment
} from '@mui/material'

const PatientProfile = () => {
  const [patientData, setPatientData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    phone: '+1 234 567 890',
    email: 'john.doe@example.com',
    address: '123 Medical Street, Healthcare City',
    bloodType: 'O+',
    allergies: 'Penicillin, Pollen',
    medicalHistory: 'Hypertension, Type 2 Diabetes',
    height: '175',
    weight: '70',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 234 567 891'
    },
    insurance: {
      provider: 'Blue Cross',
      policyNumber: 'BC123456789',
      groupNumber: 'GRP987654'
    },
    medications: 'Metformin 500mg, Lisinopril 10mg',
    lastCheckup: '2024-01-15',
    nextAppointment: '2024-04-15'
  })

  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ mb: 3 }}>
        Patient Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Patient Overview Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title='Patient Overview' />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ width: 96, height: 96, fontSize: '2rem' }}>
                  {patientData.firstName[0]}
                  {patientData.lastName[0]}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h6'>
                    {patientData.firstName} {patientData.lastName}
                  </Typography>
                  <Typography color='text.secondary'>Patient ID: #12345</Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color='text.secondary'>Age:</Typography>
                    <Typography>33 years</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color='text.secondary'>Gender:</Typography>
                    <Typography>{patientData.gender}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color='text.secondary'>Blood Type:</Typography>
                    <Typography>{patientData.bloodType}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color='text.secondary'>Height:</Typography>
                    <Typography>{patientData.height} cm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color='text.secondary'>Weight:</Typography>
                    <Typography>{patientData.weight} kg</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Details Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='Patient Information' />
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label='Personal' />
                  <Tab label='Medical' />
                  <Tab label='Contact' />
                  <Tab label='Insurance' />
                </Tabs>
              </Box>

              {/* Personal Information Tab */}
              <Box sx={{ mt: 4, display: tabValue === 0 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='First Name'
                      value={patientData.firstName}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Last Name'
                      value={patientData.lastName}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Date of Birth'
                      type='date'
                      value={patientData.dateOfBirth}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label='Gender'
                      value={patientData.gender}
                      InputProps={{ readOnly: true }}
                    >
                      <MenuItem value='Male'>Male</MenuItem>
                      <MenuItem value='Female'>Female</MenuItem>
                      <MenuItem value='Other'>Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Height'
                      value={patientData.height}
                      InputProps={{
                        readOnly: true,
                        endAdornment: <InputAdornment position='end'>cm</InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Weight'
                      value={patientData.weight}
                      InputProps={{
                        readOnly: true,
                        endAdornment: <InputAdornment position='end'>kg</InputAdornment>
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Medical Information Tab */}
              <Box sx={{ mt: 4, display: tabValue === 1 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label='Blood Type'
                      value={patientData.bloodType}
                      InputProps={{ readOnly: true }}
                    >
                      <MenuItem value='A+'>A+</MenuItem>
                      <MenuItem value='A-'>A-</MenuItem>
                      <MenuItem value='B+'>B+</MenuItem>
                      <MenuItem value='B-'>B-</MenuItem>
                      <MenuItem value='AB+'>AB+</MenuItem>
                      <MenuItem value='AB-'>AB-</MenuItem>
                      <MenuItem value='O+'>O+</MenuItem>
                      <MenuItem value='O-'>O-</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Last Checkup'
                      type='date'
                      value={patientData.lastCheckup}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Next Appointment'
                      type='date'
                      value={patientData.nextAppointment}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Allergies'
                      value={patientData.allergies}
                      InputProps={{ readOnly: true }}
                      multiline
                      rows={3}
                      maxRows={6}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Medical History'
                      value={patientData.medicalHistory}
                      InputProps={{ readOnly: true }}
                      multiline
                      rows={4}
                      maxRows={8}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Current Medications'
                      value={patientData.medications}
                      InputProps={{ readOnly: true }}
                      multiline
                      rows={3}
                      maxRows={6}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Contact Information Tab */}
              <Box sx={{ mt: 4, display: tabValue === 2 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Phone Number'
                      value={patientData.phone}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label='Email' value={patientData.email} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label='Address' value={patientData.address} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' sx={{ mt: 4, mb: 2 }}>
                      Emergency Contact
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label='Name'
                          value={patientData.emergencyContact.name}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label='Relationship'
                          value={patientData.emergencyContact.relationship}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label='Phone'
                          value={patientData.emergencyContact.phone}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>

              {/* Insurance Information Tab */}
              <Box sx={{ mt: 4, display: tabValue === 3 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Insurance Provider'
                      value={patientData.insurance.provider}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Policy Number'
                      value={patientData.insurance.policyNumber}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Group Number'
                      value={patientData.insurance.groupNumber}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant='outlined'>Print Profile</Button>
        <Button variant='contained'>Edit Profile</Button>
      </Box>
    </Box>
  )
}

export default PatientProfile
