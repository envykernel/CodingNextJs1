import Link from 'next/link'

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
import Button from '@mui/material/Button'
import PrintIcon from '@mui/icons-material/Print'

interface Medication {
  id: number
  name: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

interface PrescriptionBlockProps {
  prescription?: {
    doctor: string
    medications: Medication[]
    notes?: string
    id?: number
  }
  dictionary: any
}

function isFilled(val: any) {
  return val !== null && val !== undefined && String(val).trim() !== ''
}

const PrescriptionBlock: React.FC<PrescriptionBlockProps> = ({ prescription, dictionary }) => {
  const t = dictionary?.navigation || {}
  const theme = useTheme()

  if (!prescription) return null

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex items-center gap-3'>
          <i className='tabler-prescription text-xl text-primary' />
          <Typography variant='h6'>{t.prescriptionDetails || 'Prescription Details'}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className='flex justify-end mb-2'>
          {prescription.id && (
            <Link
              href={`/${typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'}/apps/prescriptions/${prescription.id}/print`}
              target='_blank'
              rel='noopener'
              passHref
            >
              <Button variant='outlined' color='primary' startIcon={<PrintIcon />}>
                {t.printPrescription || 'Print Prescription'}
              </Button>
            </Link>
          )}
        </div>
        <Divider className='mb-4' />
        <div className='mb-2'>
          <div className='flex items-center gap-2'>
            <Typography variant='subtitle2' className='font-semibold'>
              {t.doctor || 'Doctor'}:
            </Typography>
            <Typography>{prescription.doctor || '-'}</Typography>
          </div>
        </div>
        {prescription.medications && prescription.medications.length > 0 && (
          <div className='mb-2'>
            <Typography variant='subtitle2' className='font-semibold mb-2'>
              {t.medications || 'Medications'}
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 3, borderRadius: 2, background: theme.palette.background.paper }}
            >
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ background: theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.medication || 'Medication'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.dosage || 'Dosage'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.frequency || 'Frequency'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.duration || 'Duration'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {t.notes || 'Notes'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescription.medications.map((med, idx) => (
                    <TableRow
                      key={med.id || idx}
                      sx={{
                        background: idx % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary }}>{med.name || '-'}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>{med.dosage || '-'}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>{med.frequency || '-'}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>{med.duration || '-'}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {isFilled(med.notes) ? med.notes : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {isFilled(prescription.notes) && (
          <div className='mt-2'>
            <Typography variant='subtitle2' className='font-semibold'>
              {t.additionalNotes || 'Additional Notes'}
            </Typography>
            <Typography>{prescription.notes}</Typography>
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default PrescriptionBlock
