import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'

import { useTranslation } from '@/contexts/translationContext'

interface PatientMeasurementBlockProps {
  measurement: any
}

const PatientMeasurementBlock: React.FC<PatientMeasurementBlockProps> = ({ measurement }) => {
  const t = useTranslation()
  const tForm = t.patientMeasurementsForm
  const theme = useTheme()

  if (!measurement) return null

  const rows = [
    { label: tForm.weight, value: measurement.weight_kg ?? '-' },
    { label: tForm.height, value: measurement.height_cm ?? '-' },
    { label: tForm.temperature, value: measurement.temperature_c ?? '-' },
    { label: tForm.bloodPressureSystolic, value: measurement.blood_pressure_systolic ?? '-' },
    { label: tForm.bloodPressureDiastolic, value: measurement.blood_pressure_diastolic ?? '-' },
    { label: tForm.pulse, value: measurement.pulse ?? '-' },
    { label: tForm.oxygenSaturation, value: measurement.oxygen_saturation ?? '-' },
    { label: tForm.respiratoryRate, value: measurement.respiratory_rate ?? '-' },
    { label: tForm.notes, value: measurement.notes ?? '-' }
  ]

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex items-center gap-3'>
          <i className='tabler-activity text-xl text-primary' />
          <Typography variant='subtitle1'>{tForm.title}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 3, borderRadius: 0, background: theme.palette.background.paper }}
        >
          <Table size='small'>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow
                  key={row.label}
                  sx={{ background: idx % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover }}
                >
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{row.label}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  )
}

export default PatientMeasurementBlock
