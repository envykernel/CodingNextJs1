'use client'

// React Imports
import { useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { useSelector, useDispatch } from 'react-redux'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

// Type Imports
import type { RootState } from '@/redux-store'

// Redux Imports
import { setLoading } from '@/redux-store/slices/loading'

const GlobalLoading = () => {
  const dispatch = useDispatch()
  const pathname = usePathname()
  const { isLoading, loadingMessage } = useSelector((state: RootState) => state.loadingReducer)

  // Clear loading state on unmount or route change
  useEffect(() => {
    // Clear loading state when route changes
    dispatch(setLoading({ isLoading: false }))
  }, [dispatch, pathname])

  if (!isLoading) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme => alpha(theme.palette.background.paper, 0.8),
        zIndex: theme => theme.zIndex.modal + 1,
        backdropFilter: 'blur(4px)'
      }}
    >
      <CircularProgress size={40} />
      {loadingMessage && (
        <Typography
          sx={{
            mt: 2,
            color: 'text.primary',
            fontWeight: 500
          }}
        >
          {loadingMessage}
        </Typography>
      )}
    </Box>
  )
}

export default GlobalLoading
