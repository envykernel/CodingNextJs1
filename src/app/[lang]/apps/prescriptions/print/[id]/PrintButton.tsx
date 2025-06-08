'use client'

import { Button } from '@mui/material'

interface PrintButtonProps {
  prescription?: any
}

export default function PrintButton({ prescription }: PrintButtonProps) {
  if (!prescription) return null

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
