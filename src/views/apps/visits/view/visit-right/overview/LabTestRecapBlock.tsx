import React, { useEffect, useState } from 'react'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

interface LabTestRecapBlockProps {
  visitId: number
  dictionary: any
  showOnlyIfTestsExist?: boolean
}

const LabTestRecapBlock: React.FC<LabTestRecapBlockProps> = ({ visitId, dictionary, showOnlyIfTestsExist = false }) => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = dictionary?.labTestRecap || {}
  const theme = useTheme()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/lab-test-orders-by-visit?visitId=${visitId}`)

        if (res.ok) {
          const data = await res.json()

          setOrders(data || [])
        } else {
          setError('Failed to fetch lab test orders')
        }
      } catch (err) {
        setError('Error fetching lab test orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [visitId])

  if (loading) return null
  if (error) return <Alert severity='error'>{error}</Alert>
  if (showOnlyIfTestsExist && orders.length === 0) return null

  return (
    <>
      {orders.length > 0 ? (
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div className='flex items-center gap-3'>
              <i className='tabler-test-pipe text-xl text-primary' />
              <Typography variant='h6'>{t.title || 'Lab Test Recap'}</Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Divider className='mb-4' />
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 3, borderRadius: 0, background: theme.palette.background.paper }}
            >
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ background: theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.category || 'Category'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.testName || 'Test Name'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.status || 'Status'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.result || 'Result'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.unit || 'Unit'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.referenceRange || 'Reference Range'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.test_type?.category || '-'}</TableCell>
                      <TableCell>{order.test_type?.name || '-'}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.result_value || '-'}</TableCell>
                      <TableCell>{order.result_unit || '-'}</TableCell>
                      <TableCell>{order.reference_range || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ) : (
        <Card>
          <CardContent>
            <Typography color='text.secondary'>{t.noLabTests || 'No lab tests ordered for this visit.'}</Typography>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default LabTestRecapBlock
