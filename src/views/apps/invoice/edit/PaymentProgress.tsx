import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

const PaymentProgress = ({ invoice, t }: { invoice: any; t: any }) => {
  const total = Number(invoice?.total_amount || 0)

  const paid = Number(
    invoice?.payment_applications?.reduce((sum: number, p: any) => sum + Number(p.amount_applied), 0) || 0
  )

  const remaining = total - paid
  const percent = total ? Math.min(100, (paid / total) * 100) : 0

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between items-center'>
        <Typography variant='body2' className='font-medium'>
          {t.invoice?.totalAmount || 'Total'}: {total.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
        </Typography>
        <Typography variant='body2' className='font-medium'>
          {t.invoice?.paid || 'Paid'}: {paid.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
        </Typography>
        <Typography variant='body2' color='error' className='font-medium'>
          {t.invoice?.remaining || 'Remaining'}:{' '}
          {remaining.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
        </Typography>
      </div>
      <LinearProgress variant='determinate' value={percent} sx={{ height: 10, borderRadius: 5 }} />
    </div>
  )
}

export default PaymentProgress
