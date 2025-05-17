// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

type PatientStatisticsProps = {
  data?: UserDataType[]
  className?: string
}

// Default data if none provided
const defaultData: UserDataType[] = [
  {
    title: 'New Patients',
    stats: '0',
    avatarIcon: 'tabler-user-plus',
    avatarColor: 'success',
    trend: 'positive',
    trendNumber: '0%',
    subtitle: 'This month vs last month'
  },
  {
    title: 'New Patients',
    stats: '0',
    avatarIcon: 'tabler-user-plus',
    avatarColor: 'success',
    trend: 'positive',
    trendNumber: '0%',
    subtitle: 'This year vs last year'
  },
  {
    title: 'Disabled Patients',
    stats: '0',
    avatarIcon: 'tabler-user-off',
    avatarColor: 'error',
    trend: 'positive',
    trendNumber: '0%',
    subtitle: 'This month vs last month'
  },
  {
    title: 'Disabled Patients',
    stats: '0',
    avatarIcon: 'tabler-user-off',
    avatarColor: 'error',
    trend: 'positive',
    trendNumber: '0%',
    subtitle: 'This year vs last year'
  }
]

const PatientStatistics = ({ data = defaultData, className }: PatientStatisticsProps) => {
  return (
    <Grid container spacing={6} className={className}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default PatientStatistics
