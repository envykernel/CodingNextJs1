import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

const PaymentProgress = ({ invoice, t }: { invoice: any; t: any }) => {
  const total = Number(invoice?.total_amount || 0)

  const paid = Number(invoice?.payment_apps?.reduce((sum: number, p: any) => sum + Number(p.amount_applied), 0) || 0)

  const remaining = total - paid
  const percent = total ? Math.min(100, (paid / total) * 100) : 0

  // Get the organisation's currency, default to MAD if not set
  const currency = invoice?.organisation?.currency || 'MAD'

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency })
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between items-center'>
        <Typography variant='body2' className='font-medium'>
          {t.invoice?.totalAmount || 'Total'}: {formatCurrency(total)}
        </Typography>
        <Typography variant='body2' className='font-medium'>
          {t.invoice?.paid || 'Paid'}: {formatCurrency(paid)}
        </Typography>
        <Typography variant='body2' color='error' className='font-medium'>
          {t.invoice?.remaining || 'Remaining'}: {formatCurrency(remaining)}
        </Typography>
      </div>
      <LinearProgress variant='determinate' value={percent} sx={{ height: 10, borderRadius: 5 }} />
    </div>
  )
}

export default PaymentProgress
