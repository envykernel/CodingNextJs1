'use client'

import { Button } from '@mui/material'

interface PrintButtonProps {
  radiologyOrder?: any
}

export default function PrintButton({ radiologyOrder }: PrintButtonProps) {
  if (!radiologyOrder) return null

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
