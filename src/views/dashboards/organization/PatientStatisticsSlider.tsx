'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Types
type PatientStats = {
  totalPatients: number
  activePatients: number
  newPatients: number
  returningPatients: number
}

type Props = {
  stats: PatientStats
}

type StatItem = {
  title: string
  value: number
  icon: string
  color: 'primary' | 'success' | 'info' | 'warning' | 'secondary' | 'error'
}

const PatientStatisticsSlider = ({ stats }: Props) => {
  const statistics: StatItem[] = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: 'tabler-users',
      color: 'primary'
    },
    {
      title: 'Active Patients',
      value: stats.activePatients,
      icon: 'tabler-user-check',
      color: 'success'
    },
    {
      title: 'New Patients',
      value: stats.newPatients,
      icon: 'tabler-user-plus',
      color: 'info'
    },
    {
      title: 'Returning Patients',
      value: stats.returningPatients,
      icon: 'tabler-user-circle',
      color: 'warning'
    }
  ]

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {statistics.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' color={item.color} variant='rounded' sx={{ mr: 4 }}>
                  <i className={`${item.icon} text-xl`} />
                </CustomAvatar>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    {item.value.toLocaleString()}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {item.title}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PatientStatisticsSlider
