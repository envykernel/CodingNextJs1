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

interface LabTestRecapBlockProps {
  visitId: number
  dictionary: any
}

const LabTestRecapBlock: React.FC<LabTestRecapBlockProps> = ({ visitId, dictionary }) => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = dictionary?.labTestRecap || {}
  const theme = useTheme()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/lab-test-orders-by-visit?visitId=${visitId}`)
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setError(t.error || 'Error fetching lab test orders')
        setLoading(false)
      })
  }, [visitId])

  if (loading) return <Typography>{t.loading || 'Loading...'}</Typography>
  if (error) return <Alert severity='error'>{error}</Alert>

  // Sort orders by category (case-insensitive, empty string if missing)
  const sortedOrders = [...orders].sort((a, b) => {
    const catA = (a.test_type?.category || '').toLowerCase()
    const catB = (b.test_type?.category || '').toLowerCase()

    if (catA < catB) return -1
    if (catA > catB) return 1

    return 0
  })

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex items-center gap-3'>
          <i className='tabler-test-pipe text-xl text-primary' />
          <Typography variant='h6'>{t.title || 'Lab Test Recap'}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Divider className='mb-4' />
        {orders.length === 0 ? (
          <Typography>{t.noLabTests || 'No lab tests ordered for this visit.'}</Typography>
        ) : (
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
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                    {t.notes || 'Notes'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOrders.map((order, idx) => (
                  <TableRow
                    key={order.id}
                    sx={{ background: idx % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary }}>{order.test_type?.category || '-'}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{order.test_type?.name || '-'}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {t[order.status] || order.status || '-'}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{order.result_value ?? '-'}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{order.result_unit ?? '-'}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{order.reference_range ?? '-'}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{order.notes ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default LabTestRecapBlock
