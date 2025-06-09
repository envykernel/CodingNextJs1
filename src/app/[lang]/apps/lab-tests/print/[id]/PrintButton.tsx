'use client'

import { Button } from '@mui/material'

export default function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className='fixed bottom-4 right-4 print:hidden'>
      <Button variant='contained' onClick={handlePrint} startIcon={<i className='tabler-printer' />}>
        Imprimer
      </Button>
    </div>
  )
}
