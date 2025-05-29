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
  measurement: {
    weight_kg?: number | null
    height_cm?: number | null
    temperature_c?: number | null
    blood_pressure_systolic?: number | null
    blood_pressure_diastolic?: number | null
    pulse?: number | null
    oxygen_saturation?: number | null
    respiratory_rate?: number | null
    notes?: string | null
  } | null
}

const PatientMeasurementBlock: React.FC<PatientMeasurementBlockProps> = ({ measurement }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  if (!measurement) return null

  const rows = [
    { label: t('patientMeasurementsForm.weight'), value: measurement.weight_kg ?? '-' },
    { label: t('patientMeasurementsForm.height'), value: measurement.height_cm ?? '-' },
    { label: t('patientMeasurementsForm.temperature'), value: measurement.temperature_c ?? '-' },
    { label: t('patientMeasurementsForm.bloodPressureSystolic'), value: measurement.blood_pressure_systolic ?? '-' },
    { label: t('patientMeasurementsForm.bloodPressureDiastolic'), value: measurement.blood_pressure_diastolic ?? '-' },
    { label: t('patientMeasurementsForm.pulse'), value: measurement.pulse ?? '-' },
    { label: t('patientMeasurementsForm.oxygenSaturation'), value: measurement.oxygen_saturation ?? '-' },
    { label: t('patientMeasurementsForm.respiratoryRate'), value: measurement.respiratory_rate ?? '-' },
    { label: t('patientMeasurementsForm.notes'), value: measurement.notes ?? '-' }
  ]

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex items-center gap-3'>
          <i className='tabler-activity text-xl text-primary' />
          <Typography variant='subtitle1'>{t('patientMeasurementsForm.title')}</Typography>
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
