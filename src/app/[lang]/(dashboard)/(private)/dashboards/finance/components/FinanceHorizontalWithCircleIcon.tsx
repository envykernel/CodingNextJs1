'use client'

// MUI Imports
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import type { CardProps } from '@mui/material/Card'

// Types Imports
import type { ThemeColor } from '@core/types'

type Props = CardProps & {
  color: ThemeColor
}

const Card = styled(MuiCard)<Props>(({ color }) => ({
  transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
  borderBottomWidth: '2px',
  borderBottomColor: `var(--mui-palette-${color}-darkerOpacity)`,
  '[data-skin="bordered"] &:hover': {
    boxShadow: 'none'
  },
  '&:hover': {
    borderBottomWidth: '3px',
    borderBottomColor: `var(--mui-palette-${color}-main) !important`,
    boxShadow: 'var(--mui-customShadows-lg)',
    marginBlockEnd: '-1px'
  }
}))

type FinanceHorizontalWithCircleIconProps = {
  title: string
  stats: string | number
  trendNumber: number
  trendPeriod: 'This Week' | 'This Month' | 'This Year'
  icon: JSX.Element
  color: ThemeColor
  formatValue?: (value: number) => string
}

const FinanceHorizontalWithCircleIcon = (props: FinanceHorizontalWithCircleIconProps) => {
  // Props
  const { title, stats, trendNumber, trendPeriod, icon, color, formatValue } = props

  const getTrendText = () => {
    switch (trendPeriod) {
      case 'This Year':
        return 'vs last year'
      case 'This Month':
        return 'vs last 3 months average'
      case 'This Week':
        return 'vs last week'
      default:
        return 'vs last period'
    }
  }

  const formatTrendValue = (value: number) => {
    if (formatValue) {
      return formatValue(value)
    }

    return trendPeriod === 'This Year' ? `${value.toFixed(1)}%` : value.toString()
  }

  return (
    <Card color={color || 'primary'}>
      <CardContent className='flex flex-col gap-1'>
        <div className='flex items-center gap-4'>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: `${color}.main`,
              color: 'white'
            }}
          >
            {icon}
          </Box>
          <Typography variant='h4'>{stats}</Typography>
        </div>
        <div className='flex flex-col gap-1'>
          <Typography>{title}</Typography>
          <div className='flex items-center gap-2'>
            <Typography color='text.primary' className='font-medium'>
              {`${trendNumber > 0 ? '+' : ''}${formatTrendValue(trendNumber)}`}
            </Typography>
            <Typography variant='body2' color='text.disabled'>
              {getTrendText()}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FinanceHorizontalWithCircleIcon
