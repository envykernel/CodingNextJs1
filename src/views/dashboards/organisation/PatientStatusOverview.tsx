'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Types
type StatusItem = {
  title: string
  value: number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
  trend: {
    value: number
    isPositive: boolean
  }
}

const PatientStatusOverview = () => {
  // Sample data - In a real app, this would come from an API
  const statusData: StatusItem[] = [
    {
      title: 'Scheduled',
      value: 45,
      icon: 'tabler-calendar-event',
      color: 'primary',
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: 'In Treatment',
      value: 28,
      icon: 'tabler-stethoscope',
      color: 'success',
      trend: {
        value: 8,
        isPositive: true
      }
    },
    {
      title: 'Follow-up',
      value: 15,
      icon: 'tabler-clock',
      color: 'warning',
      trend: {
        value: 5,
        isPositive: false
      }
    },
    {
      title: 'Completed',
      value: 32,
      icon: 'tabler-check',
      color: 'info',
      trend: {
        value: 15,
        isPositive: true
      }
    }
  ]

  return (
    <Card>
      <CardHeader title='Patient Status' subheader='Current patient status overview' />
      <CardContent>
        <Grid container spacing={6}>
          {statusData.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CustomAvatar skin='light' color={item.color} variant='rounded' sx={{ mr: 4 }}>
                  <i className={`${item.icon} text-xl`} />
                </CustomAvatar>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {item.title}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant='body2'
                  sx={{
                    color: item.trend.isPositive ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <i className={`tabler-arrow-${item.trend.isPositive ? 'up' : 'down'} text-sm mie-1`} />
                  {item.trend.value}%
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.disabled', ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PatientStatusOverview
