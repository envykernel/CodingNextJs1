// MUI Import
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Component Imports
import PaymentForm from './PaymentForm'

type Props = {
  open: boolean
  handleClose: () => void
  invoice?: any
}

const AddPaymentDrawer = ({ open, handleClose, invoice }: Props) => {
  // Add payments and balance calculation
  const payments = Array.isArray(invoice?.payment_applications) ? invoice.payment_applications : []

  const invoiceBalance =
    Number(invoice?.total_amount || 0) - payments.reduce((sum: number, p: any) => sum + Number(p.amount_applied), 0)

  const handleFormSubmit = () => {
    // TODO: Call API to create payment and payment application
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Add Payment</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        {/* List of existing payments */}
        {payments.length > 0 && (
          <div className='mb-6'>
            <Typography variant='subtitle1' className='mb-2'>
              Payments
            </Typography>
            {payments.map((p: any, idx: number) => (
              <div key={idx} className='flex justify-between mb-1'>
                <Typography variant='body2'>{p.payment_method || 'Payment'}</Typography>
                <Typography variant='body2' color='text.primary'>
                  {Number(p.amount_applied).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </div>
            ))}
          </div>
        )}
        <PaymentForm
          invoice={invoice}
          payments={payments}
          invoiceBalance={invoiceBalance}
          onSubmit={handleFormSubmit}
        />
      </div>
    </Drawer>
  )
}

export default AddPaymentDrawer
