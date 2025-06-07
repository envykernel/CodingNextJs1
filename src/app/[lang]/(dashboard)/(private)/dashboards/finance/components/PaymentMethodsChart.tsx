'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Grid from '@mui/material/Grid2'

import { useTranslation } from '@/contexts/translationContext'

interface PaymentMethodsChartProps {
  data: {
    series: number[]
    labels: string[]
  }
}

type PaymentMethodType = {
  heading: string
  amount: number
  percentage: number
}

const PaymentMethodsChart = ({ data }: PaymentMethodsChartProps) => {
  const { t } = useTranslation()

  const formatAmount = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return 'MAD 0.00'

    return value.toLocaleString('en-US', { style: 'currency', currency: 'MAD' })
  }

  // Calculate percentages only if we have valid data
  const totalAmount = data.series.reduce((a, b) => (a || 0) + (b || 0), 0)

  const paymentMethods: PaymentMethodType[] = data.labels
    .map((method, index) => {
      // Convert method to translation key format (lowercase, underscores)
      const translationKey = method.toLowerCase().replace(/\s+/g, '_')

      return {
        heading: t(`thisWeekPayments.paymentMethods.${translationKey}`) || method,
        amount: data.series[index] || 0,
        percentage: totalAmount ? ((data.series[index] || 0) / totalAmount) * 100 : 0
      }
    })
    .filter(item => item.amount > 0) // Filter out items with zero amount

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardHeader
          title={t('paymentStatistics.paymentMethods.title')}
          subheader={t('paymentStatistics.paymentMethods.distribution')}
          titleTypographyProps={{ variant: 'subtitle1' }}
          subheaderTypographyProps={{ variant: 'caption' }}
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <div className='grid grid-cols-1 gap-2'>
            {paymentMethods.map((item, index) => (
              <div key={index} className='flex flex-col gap-1 p-2 rounded border border-divider bg-background-paper'>
                <div className='flex items-center justify-between'>
                  <Typography variant='body2' fontWeight='medium'>
                    {item.heading}
                  </Typography>
                  <Typography variant='body2' fontWeight='medium'>
                    {formatAmount(item.amount)}
                  </Typography>
                </div>
                <LinearProgress
                  variant='determinate'
                  value={item.percentage}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'primary.main',
                      borderRadius: 2
                    }
                  }}
                />
                <Typography variant='caption' color='text.secondary'>
                  {item.percentage.toFixed(1)}%
                </Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default PaymentMethodsChart
