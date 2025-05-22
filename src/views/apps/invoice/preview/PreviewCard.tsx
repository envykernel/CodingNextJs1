// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Divider from '@mui/material/Divider'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import './print.css'

const splitServiceName = (name: string) => {
  if (!name) return ''
  if (name.length <= 100) return name
  const idx = name.lastIndexOf(' ', 100)

  if (idx === -1) {
    // No space before 100, try after
    const nextSpace = name.indexOf(' ', 100)

    if (nextSpace === -1) return name // No space at all

    return (
      <>
        {name.slice(0, nextSpace)}
        <br />
        {name.slice(nextSpace + 1)}
      </>
    )
  }

  return (
    <>
      {name.slice(0, idx)}
      <br />
      {name.slice(idx + 1)}
    </>
  )
}

const PreviewCard = ({ invoiceData, id }: { invoiceData: any; id: string }) => {
  // Calculate totals
  const subtotal = invoiceData.lines.reduce((sum: number, line: any) => sum + Number(line.line_total), 0)
  const discount = Number(invoiceData.discount || 0)
  const tax = Number(invoiceData.tax || 0)
  const total = subtotal - discount + tax

  return (
    <Card className='previewCard'>
      <CardContent className='sm:!p-12'>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <div className='p-6 bg-actionHover rounded'>
              <div className='flex justify-between gap-y-4 flex-col sm:flex-row'>
                <div className='flex flex-col gap-6'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <i className='tabler-building text-lg text-gray-500' />
                      <Typography color='text.primary'>{invoiceData.organisation?.name || ''}</Typography>
                    </div>
                    <div className='flex items-center gap-2 mb-1'>
                      <i className='tabler-map-pin text-lg text-gray-500' />
                      <Typography color='text.primary'>{invoiceData.organisation?.address || ''}</Typography>
                    </div>
                    <div className='flex items-center gap-2'>
                      <i className='tabler-phone text-lg text-gray-500' />
                      <Typography color='text.primary'>{invoiceData.organisation?.phone_number || ''}</Typography>
                    </div>
                    <div className='flex items-center gap-2'>
                      <i className='tabler-mail text-lg text-gray-500' />
                      <Typography color='text.primary'>{invoiceData.organisation?.email || ''}</Typography>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-6'>
                  <Typography variant='h5'>{`Invoice #${invoiceData.invoice_number || id}`}</Typography>
                  <div className='flex flex-col gap-1'>
                    <Typography color='text.primary'>{`Date : ${invoiceData.invoice_date ? invoiceData.invoice_date.toString().split('T')[0] : ''}`}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Invoice To: <strong>{invoiceData.patient?.name}</strong>
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <div className='overflow-x-auto border rounded'>
              <table className={tableStyles.table}>
                <thead className='border-bs-0'>
                  <tr>
                    <th className='!bg-transparent'>Item</th>
                    <th className='!bg-transparent'>Qty</th>
                    <th className='!bg-transparent'>Unit Price</th>
                    <th className='!bg-transparent'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lines.map((line: any, index: number) => (
                    <tr key={index}>
                      <td>
                        <Typography color='text.primary'>{splitServiceName(line.service?.name || '-')}</Typography>
                      </td>
                      <td>
                        <Typography color='text.primary'>{line.quantity}</Typography>
                      </td>
                      <td>
                        <Typography color='text.primary'>
                          {Number(line.unit_price).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                        </Typography>
                      </td>
                      <td>
                        <Typography color='text.primary'>
                          {Number(line.line_total).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <div className='min-is-[200px] ml-auto'>
              <div className='flex items-center justify-end' id='total-row'>
                <Typography className='font-medium text-right' color='text.primary' style={{ marginRight: 8 }}>
                  Total:
                </Typography>
                <Typography className='font-medium text-right' color='text.primary' style={{ minWidth: 120 }}>
                  {total.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <hr style={{ width: '100%', border: 0, borderTop: '2px solid #ccc', marginTop: 4, marginBottom: 0 }} />
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider className='border-dashed' />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PreviewCard
