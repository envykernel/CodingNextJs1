'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'

import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'

import MedicationDrawer from './MedicationDrawer'

interface Medication {
  id: number
  name: string
  category: string | null
  dosages: string[]
  organisation_id: number | null
}

export default function MedicationList() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)

  const isAdmin = session?.user?.role === 'ADMIN'
  const userOrgId = Number(session?.user?.organisationId)

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications')

      if (!response.ok) {
        throw new Error('Failed to fetch medications')
      }

      const data = await response.json()

      // Filter medications to show only:
      // 1. Medications from user's organization
      // 2. Medications not linked to any organization (NULL organisation_id)
      const filteredMedications = data.filter(
        (med: Medication) => med.organisation_id === userOrgId || med.organisation_id === null
      )

      setMedications(filteredMedications)
    } catch (error) {
      console.error('Error fetching medications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [isAdmin, userOrgId])

  const handleEdit = (medication: Medication) => {
    // Only allow editing if medication belongs to user's organization
    if (medication.organisation_id !== userOrgId) {
      alert(t('unauthorizedEditMedication') || 'You can only edit medications from your organization')

      return
    }

    setSelectedMedication(medication)
    setDrawerOpen(true)
  }

  const handleDelete = async (id: number) => {
    // Find the medication to check organization
    const medication = medications.find(med => med.id === id)

    if (!medication) return

    // Only allow deletion if medication belongs to user's organization
    if (medication.organisation_id !== userOrgId) {
      alert(t('unauthorizedDeleteMedication') || 'You can only delete medications from your organization')

      return
    }

    if (!confirm(t('confirmation.deleteMedication') || 'Are you sure you want to delete this medication?')) {
      return
    }

    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete medication')
      }

      fetchMedications()
    } catch (error) {
      console.error('Error deleting medication:', error)
      alert(t('errorDeletingMedication') || 'Error deleting medication')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h5'>{t('medications') || 'Medications'}</Typography>
              <Button
                variant='contained'
                onClick={() => {
                  setSelectedMedication(null)
                  setDrawerOpen(true)
                }}
                startIcon={<i className='tabler-plus' />}
              >
                {t('addMedication') || 'Add Medication'}
              </Button>
            </Box>

            <TableContainer component={Paper}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('medication') || 'Medication'}</TableCell>
                      <TableCell>{t('category') || 'Category'}</TableCell>
                      <TableCell>{t('dosage') || 'Dosages'}</TableCell>
                      <TableCell>{t('organization') || 'Organization'}</TableCell>
                      <TableCell>{t('actions') || 'Actions'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medications.map(medication => (
                      <TableRow key={medication.id}>
                        <TableCell>{medication.name}</TableCell>
                        <TableCell>{medication.category || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {medication.dosages.map((dosage, index) => (
                              <Typography
                                key={index}
                                variant='body2'
                                sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}
                              >
                                {dosage}
                              </Typography>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {medication.organisation_id === null
                            ? t('global') || 'Global'
                            : medication.organisation_id === userOrgId
                              ? t('yourOrganization') || 'Your Organization'
                              : t('otherOrganization') || 'Other Organization'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {medication.organisation_id === userOrgId && (
                              <>
                                <Button
                                  variant='outlined'
                                  size='small'
                                  onClick={() => handleEdit(medication)}
                                  startIcon={<i className='tabler-edit' />}
                                >
                                  {t('edit') || 'Edit'}
                                </Button>
                                <Button
                                  variant='outlined'
                                  color='error'
                                  size='small'
                                  onClick={() => handleDelete(medication.id)}
                                  startIcon={<i className='tabler-trash' />}
                                >
                                  {t('delete') || 'Delete'}
                                </Button>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Box>
        </Card>
      </Grid>

      <MedicationDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedMedication(null)
        }}
        medication={selectedMedication}
        onSave={() => {
          fetchMedications()
          setDrawerOpen(false)
          setSelectedMedication(null)
        }}
      />
    </Grid>
  )
}
