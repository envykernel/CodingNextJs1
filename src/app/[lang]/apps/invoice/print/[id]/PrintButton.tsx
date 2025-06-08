'use client'

import Button from '@mui/material/Button'

const PrintButton = () => {
  return (
    <div className='fixed bottom-4 right-4 print:hidden'>
      <Button variant='contained' onClick={() => window.print()} startIcon={<i className='tabler-printer' />}>
        Print
      </Button>
    </div>
  )
}

export default PrintButton
