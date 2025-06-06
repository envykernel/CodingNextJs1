'use client'

import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Grid from '@mui/material/Grid2'

import classnames from 'classnames'

import tableStyles from '@core/styles/table.module.css'
import styles from '@views/apps/logistics/dashboard/styles.module.css'

interface PaymentMethodsChartProps {
  data: {
    series: number[]
    labels: string[]
  }
}

type PaymentMethodType = {
  icon: string
  heading: string
  progressColor: string
  progressColorVariant: string
  amount: number
  percentage: number
}

const PaymentMethodsChart = ({ data }: PaymentMethodsChartProps) => {
  const theme = useTheme()

  const formatAmount = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return '€0.00'

    return value.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })
  }

  // Calculate percentages only if we have valid data
  const totalAmount = data.series.reduce((a, b) => (a || 0) + (b || 0), 0)

  const paymentMethods: PaymentMethodType[] = [
    {
      icon: 'tabler-credit-card',
      heading: 'CREDIT_CARD',
      progressColor: 'action',
      progressColorVariant: 'hover',
      amount: data.series[0] || 0,
      percentage: totalAmount ? ((data.series[0] || 0) / totalAmount) * 100 : 0
    },
    {
      icon: 'tabler-building-bank',
      heading: 'BANK_TRANSFER',
      progressColor: 'primary',
      progressColorVariant: 'main',
      amount: data.series[1] || 0,
      percentage: totalAmount ? ((data.series[1] || 0) / totalAmount) * 100 : 0
    },
    {
      icon: 'tabler-cash',
      heading: 'CASH',
      progressColor: 'info',
      progressColorVariant: 'main',
      amount: data.series[2] || 0,
      percentage: totalAmount ? ((data.series[2] || 0) / totalAmount) * 100 : 0
    },
    {
      icon: 'tabler-wallet',
      heading: 'WALLET',
      progressColor: 'SnackbarContent',
      progressColorVariant: 'bg',
      amount: data.series[3] || 0,
      percentage: totalAmount ? ((data.series[3] || 0) / totalAmount) * 100 : 0
    },
    {
      icon: 'tabler-transfer',
      heading: 'TRANSFER',
      progressColor: 'primary',
      progressColorVariant: 'main',
      amount: data.series[4] || 0,
      percentage: totalAmount ? ((data.series[4] || 0) / totalAmount) * 100 : 0
    },
    {
      icon: 'tabler-coin',
      heading: 'CRYPTO',
      progressColor: 'info',
      progressColorVariant: 'main',
      amount: data.series[5] || 0,
      percentage: totalAmount ? ((data.series[5] || 0) / totalAmount) * 100 : 0
    }
  ].filter(item => item.amount > 0) // Filter out items with zero amount

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardHeader title='Payment Methods' subheader='Distribution of payments by method' />
        <CardContent sx={{ width: '100%', px: 4, py: 0 }}>
          <div className='flex flex-col gap-6 w-full'>
            <div className='flex w-full'>
              {paymentMethods.map((item, index) => (
                <div
                  key={index}
                  className={classnames(
                    `is-[${item.percentage}%]`,
                    styles.linearRound,
                    'flex flex-col gap-[38px] relative w-full'
                  )}
                >
                  <Typography className={classnames(styles.header, 'relative max-sm:hidden')}>
                    {item.heading.replace('_', ' ')}
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={-1}
                    className='bs-[46px] w-full'
                    sx={{
                      backgroundColor: `var(--mui-palette-${item.progressColor}-${item.progressColorVariant})`,
                      borderRadius: 0,
                      width: '100%'
                    }}
                  />
                  <Typography
                    variant='body2'
                    className='absolute bottom-3 start-2 font-medium'
                    sx={{
                      color: theme =>
                        index === 0
                          ? 'var(--mui-palette-text-primary)'
                          : item.progressColor === 'info'
                            ? 'var(--mui-palette-common-white)'
                            : // eslint-disable-next-line lines-around-comment
                              // @ts-ignore
                              theme.palette.getContrastText(
                                theme.palette[item.progressColor][item.progressColorVariant]
                              )
                    }}
                  >
                    {formatAmount(item.amount)}
                  </Typography>
                </div>
              ))}
            </div>
            <div className='overflow-x-auto w-full'>
              <table className={classnames(tableStyles.table, 'w-full')}>
                <tbody>
                  {paymentMethods.map((item, index) => (
                    <tr key={index} className='w-full'>
                      <td className='flex items-center gap-2 pis-0'>
                        <i className={classnames(item.icon, 'text-textPrimary text-[1.5rem]')}></i>
                        <Typography color='text.primary'>{item.heading.replace('_', ' ')}</Typography>
                      </td>
                      <td className='text-end'>
                        <Typography color='text.primary' className='font-medium'>
                          {formatAmount(item.amount)}
                        </Typography>
                      </td>
                      <td className='text-end pie-0'>
                        <Typography>{item.percentage.toFixed(1)}%</Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default PaymentMethodsChart
