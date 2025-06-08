'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/contexts/translationContext'
import { useParams } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  Box,
  Stack,
  Chip,
  Tooltip,
  ButtonGroup,
  Grid
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import MedicationIcon from '@mui/icons-material/Medication'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import InfoIcon from '@mui/icons-material/Info'
import EventNoteIcon from '@mui/icons-material/EventNote'

interface Prescription {
  id: number
  date: string
  doctor: string
  visitId: number
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes: string
  }[]
  notes: string
}

interface PrescriptionsTabProps {
  patientId: number
  patientData: any
}

const PrescriptionsTab = ({ patientId, patientData }: PrescriptionsTabProps) => {
  const { t } = useTranslation()
  const params = useParams()
  const locale = (params as any)?.lang || 'en'
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch(`/api/prescriptions/patient/${patientId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch prescriptions')
        }
        const data = await response.json()
        setPrescriptions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [patientId])

  const toggleRow = (prescriptionId: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(prescriptionId)) {
      newExpandedRows.delete(prescriptionId)
    } else {
      newExpandedRows.add(prescriptionId)
    }
    setExpandedRows(newExpandedRows)
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={t('patientView.tabs.prescriptions')} avatar={<LocalPharmacyIcon color='primary' />} />
      <CardContent>
        {prescriptions.length === 0 ? (
          <Typography variant='body1' color='text.secondary' align='center'>
            {t('navigation.visitDetails.noPrescriptions')}
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding='checkbox' />
                  <TableCell>{t('date')}</TableCell>
                  <TableCell>{t('doctor')}</TableCell>
                  <TableCell align='right'>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.map(prescription => (
                  <React.Fragment key={prescription.id}>
                    <TableRow
                      hover
                      onClick={() => toggleRow(prescription.id)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <TableCell padding='checkbox'>
                        <IconButton size='small'>
                          {expandedRows.has(prescription.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{new Date(prescription.date).toLocaleDateString()}</TableCell>
                      <TableCell>{prescription.doctor}</TableCell>
                      <TableCell align='right'>
                        <Box
                          sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <Button
                            variant='outlined'
                            startIcon={<EventNoteIcon />}
                            href={prescription.visitId ? `/${locale}/apps/visits/view/${prescription.visitId}` : '#'}
                            target='_blank'
                            disabled={!prescription.visitId}
                            title={!prescription.visitId ? 'Visit not available' : ''}
                          >
                            {t('navigation.visitDetails.goToVisit')}
                          </Button>
                          <Button
                            variant='outlined'
                            startIcon={<PrintIcon />}
                            href={`/${locale}/apps/prescriptions/print/${prescription.id}`}
                            target='_blank'
                          >
                            {t('navigation.printPrescription')}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                        <Collapse in={expandedRows.has(prescription.id)} timeout='auto' unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            {prescription.notes && (
                              <Box
                                sx={{
                                  mb: 3,
                                  p: 2,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  backgroundColor: 'background.paper'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <InfoIcon color='info' fontSize='small' />
                                  <Typography variant='subtitle2' color='text.secondary'>
                                    {t('notes')}
                                  </Typography>
                                </Box>
                                <Typography variant='body2'>{prescription.notes}</Typography>
                              </Box>
                            )}
                            <Typography variant='h6' gutterBottom component='div'>
                              {t('medications')}
                            </Typography>
                            <Stack spacing={2}>
                              {prescription.medications.map((medication, index) => (
                                <Paper
                                  key={index}
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    '&:hover': {
                                      backgroundColor: 'action.hover'
                                    }
                                  }}
                                >
                                  <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <MedicationIcon color='primary' fontSize='small' />
                                      <Typography variant='subtitle1'>{medication.name}</Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={4}>
                                        <Typography variant='body2' color='text.secondary'>
                                          {t('dosage')}: {medication.dosage}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={4}>
                                        <Typography variant='body2' color='text.secondary'>
                                          {t('frequency')}: {medication.frequency}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={4}>
                                        <Typography variant='body2' color='text.secondary'>
                                          {t('duration')}: {medication.duration}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                    {medication.notes && (
                                      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                                        {t('notes')}: {medication.notes}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default PrescriptionsTab
