import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

interface MedicalDataTabProps {
  patientData: any
}

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const d = new Date(dateString)

  // Format: YYYY-MM-DD HH:mm
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'

  return new Date(dateString).toISOString().slice(0, 10)
}

const MedicalDataTab = ({ patientData }: MedicalDataTabProps) => {
  const measurements = patientData?.patient_measurements || []
  const medicals = patientData?.patient_medical || []
  const history = patientData?.patient_medical_history || []

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-heartbeat text-xl text-primary' />
            <Typography variant='h6'>Measurements</Typography>
          </div>
          <Divider className='mb-4' />
          {measurements.length === 0 ? (
            <Typography>No measurements available.</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left p-2'>Date</th>
                    <th className='text-left p-2'>Weight (kg)</th>
                    <th className='text-left p-2'>Height (cm)</th>
                    <th className='text-left p-2'>Temperature (°C)</th>
                    <th className='text-left p-2'>BP Systolic</th>
                    <th className='text-left p-2'>BP Diastolic</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m: any) => (
                    <tr key={m.id}>
                      <td className='p-2'>{formatDateTime(m.measured_at)}</td>
                      <td className='p-2'>{m.weight_kg ?? '-'}</td>
                      <td className='p-2'>{m.height_cm ?? '-'}</td>
                      <td className='p-2'>{m.temperature_c ?? '-'}</td>
                      <td className='p-2'>{m.blood_pressure_systolic ?? '-'}</td>
                      <td className='p-2'>{m.blood_pressure_diastolic ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-notes text-xl text-primary' />
            <Typography variant='h6'>Medical History</Typography>
          </div>
          <Divider className='mb-4' />
          {history.length === 0 ? (
            <Typography>No medical history available.</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left p-2'>Type</th>
                    <th className='text-left p-2'>Description</th>
                    <th className='text-left p-2'>Date Occurred</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h: any) => (
                    <tr key={h.id}>
                      <td className='p-2'>{h.history_type || '-'}</td>
                      <td className='p-2'>{h.description}</td>
                      <td className='p-2'>{formatDate(h.date_occurred)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-medical-cross text-xl text-primary' />
            <Typography variant='h6'>Other Medical Info</Typography>
          </div>
          <Divider className='mb-4' />
          {medicals.length === 0 ? (
            <Typography>No additional medical info available.</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left p-2'>Record ID</th>
                    {/* Add more headers here if there are more fields */}
                  </tr>
                </thead>
                <tbody>
                  {medicals.map((m: any) => (
                    <tr key={m.id}>
                      <td className='p-2'>{m.id}</td>
                      {/* Add more cells here if there are more fields */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MedicalDataTab
