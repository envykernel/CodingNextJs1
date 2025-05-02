'use client'

import { useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

const PatientProfileView = () => {
  const [patientData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    phone: '+1 234 567 890',
    email: 'john.doe@example.com',
    address: '123 Medical Street, Healthcare City',
    bloodType: 'O+',
    allergies: [
      { condition: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
      { condition: 'Pollen', severity: 'Moderate', reaction: 'Seasonal rhinitis' },
      { condition: 'Shellfish', severity: 'Mild', reaction: 'Hives' },
      { condition: 'Latex', severity: 'Moderate', reaction: 'Contact dermatitis' }
    ],
    medicalHistory: [
      { condition: 'Hypertension', diagnosisDate: '2018', status: 'Ongoing', notes: 'Well controlled with medication' },
      { condition: 'Type 2 Diabetes', diagnosisDate: '2020', status: 'Ongoing', notes: 'Diet controlled' },
      { condition: 'Asthma', diagnosisDate: 'Childhood', status: 'Intermittent', notes: 'Exercise-induced' },
      { condition: 'Appendectomy', diagnosisDate: '2015', status: 'Resolved', notes: 'No complications' }
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', purpose: 'Diabetes management' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', purpose: 'Blood pressure control' },
      { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', purpose: 'Cardiovascular prevention' },
      { name: 'Albuterol inhaler', dosage: '2 puffs', frequency: 'As needed', purpose: 'Asthma relief' },
      { name: 'Vitamin D3', dosage: '1000IU', frequency: 'Daily', purpose: 'Supplement' }
    ],
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
    lastCheckup: '2024-01-15',
    nextAppointment: '2024-04-15'
  })

  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const renderInfoItem = (label: string, value: string, icon?: string) => (
    <ListItem>
      {icon && (
        <ListItemIcon>
          <i className={icon} />
        </ListItemIcon>
      )}
      <ListItemText
        primary={label}
        secondary={value}
        primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
        secondaryTypographyProps={{ color: 'text.primary', variant: 'body1' }}
      />
    </ListItem>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ mb: 3 }}>
        Patient Profile View
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
                  <List dense>
                    {renderInfoItem('Age', '33 years', 'tabler-calendar')}
                    {renderInfoItem('Gender', patientData.gender, 'tabler-gender-bigender')}
                    {renderInfoItem('Blood Type', patientData.bloodType, 'tabler-droplet')}
                    {renderInfoItem('Height', `${patientData.height} cm`, 'tabler-ruler')}
                    {renderInfoItem('Weight', `${patientData.weight} kg`, 'tabler-weight')}
                  </List>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='Patient Information' />
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label='Personal' />
                  <Tab label='Medical' />
                  <Tab label='Contact' />
                  <Tab label='Insurance' />
                </Tabs>
              </Box>

              {/* Personal Information Tab */}
              <Box sx={{ mt: 4, display: activeTab === 0 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      {renderInfoItem('First Name', patientData.firstName, 'tabler-user')}
                      {renderInfoItem('Last Name', patientData.lastName, 'tabler-user')}
                      {renderInfoItem('Date of Birth', patientData.dateOfBirth, 'tabler-calendar')}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      {renderInfoItem('Gender', patientData.gender, 'tabler-gender-bigender')}
                      {renderInfoItem('Height', `${patientData.height} cm`, 'tabler-ruler')}
                      {renderInfoItem('Weight', `${patientData.weight} kg`, 'tabler-weight')}
                    </List>
                  </Grid>
                </Grid>
              </Box>

              {/* Medical Information Tab */}
              <Box sx={{ mt: 4, display: activeTab === 1 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant='h6' sx={{ mb: 4, color: 'text.secondary' }}>
                      Basic Information
                    </Typography>
                    <Grid container spacing={6}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <i className='tabler-droplet' style={{ fontSize: '1.5rem', opacity: 0.7 }} />
                          <Box>
                            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                              Blood Type
                            </Typography>
                            <Typography variant='body1'>{patientData.bloodType}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <i className='tabler-calendar-check' style={{ fontSize: '1.5rem', opacity: 0.7 }} />
                          <Box>
                            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                              Last Checkup
                            </Typography>
                            <Typography variant='body1'>{patientData.lastCheckup}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <i className='tabler-calendar-event' style={{ fontSize: '1.5rem', opacity: 0.7 }} />
                          <Box>
                            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                              Next Appointment
                            </Typography>
                            <Typography variant='body1'>{patientData.nextAppointment}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='h6' sx={{ mb: 4, mt: 4, color: 'text.secondary' }}>
                      Medical Details
                    </Typography>
                    <Grid container spacing={6}>
                      <Grid item xs={12}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <i className='tabler-alert-triangle' style={{ fontSize: '1.5rem', opacity: 0.7 }} />
                            <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                              Allergies
                            </Typography>
                          </Box>
                          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Reaction</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {patientData.allergies.map((allergy, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{allergy.condition}</TableCell>
                                    <TableCell>{allergy.severity}</TableCell>
                                    <TableCell>{allergy.reaction}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <i className='tabler-history' style={{ fontSize: '1.5rem', opacity: 0.7 }} />
                            <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                              Medical History
                            </Typography>
                          </Box>
                          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Diagnosis Date</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {patientData.medicalHistory.map((history, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{history.condition}</TableCell>
                                    <TableCell>{history.diagnosisDate}</TableCell>
                                    <TableCell>{history.status}</TableCell>
                                    <TableCell>{history.notes}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <i className='tabler-pill' style={{ fontSize: '1.5rem', opacity: 0.7 }} />
                            <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                              Current Medications
                            </Typography>
                          </Box>
                          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700 }}>Medication</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Dosage</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {patientData.medications.map((medication, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{medication.name}</TableCell>
                                    <TableCell>{medication.dosage}</TableCell>
                                    <TableCell>{medication.frequency}</TableCell>
                                    <TableCell>{medication.purpose}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>

              {/* Contact Information Tab */}
              <Box sx={{ mt: 4, display: activeTab === 2 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      {renderInfoItem('Phone Number', patientData.phone, 'tabler-phone')}
                      {renderInfoItem('Email', patientData.email, 'tabler-mail')}
                      {renderInfoItem('Address', patientData.address, 'tabler-map-pin')}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle1' sx={{ mb: 2 }}>
                      Emergency Contact
                    </Typography>
                    <List>
                      {renderInfoItem('Name', patientData.emergencyContact.name, 'tabler-user')}
                      {renderInfoItem('Relationship', patientData.emergencyContact.relationship, 'tabler-users')}
                      {renderInfoItem('Phone', patientData.emergencyContact.phone, 'tabler-phone')}
                    </List>
                  </Grid>
                </Grid>
              </Box>

              {/* Insurance Information Tab */}
              <Box sx={{ mt: 4, display: activeTab === 3 ? 'block' : 'none' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      {renderInfoItem('Insurance Provider', patientData.insurance.provider, 'tabler-building')}
                      {renderInfoItem('Policy Number', patientData.insurance.policyNumber, 'tabler-file-text')}
                      {renderInfoItem('Group Number', patientData.insurance.groupNumber, 'tabler-users')}
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PatientProfileView
