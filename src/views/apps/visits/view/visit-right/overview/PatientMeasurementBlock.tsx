import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'

import { useTranslation } from '@/contexts/translationContext'

interface PatientMeasurementBlockProps {
  measurement: any
}

const PatientMeasurementBlock: React.FC<PatientMeasurementBlockProps> = ({ measurement }) => {
  const t = useTranslation()
  const tForm = t.patientMeasurementsForm

  if (!measurement) return null

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='subtitle1'>{tForm.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table className='min-w-full text-sm'>
          <tbody>
            <tr>
              <td>
                <b>{tForm.weight}:</b>
              </td>
              <td>{measurement.weight_kg ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.height}:</b>
              </td>
              <td>{measurement.height_cm ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.temperature}:</b>
              </td>
              <td>{measurement.temperature_c ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.bloodPressureSystolic}:</b>
              </td>
              <td>{measurement.blood_pressure_systolic ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.bloodPressureDiastolic}:</b>
              </td>
              <td>{measurement.blood_pressure_diastolic ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.pulse}:</b>
              </td>
              <td>{measurement.pulse ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.oxygenSaturation}:</b>
              </td>
              <td>{measurement.oxygen_saturation ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.respiratoryRate}:</b>
              </td>
              <td>{measurement.respiratory_rate ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <b>{tForm.notes}:</b>
              </td>
              <td>{measurement.notes ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  )
}

export default PatientMeasurementBlock
