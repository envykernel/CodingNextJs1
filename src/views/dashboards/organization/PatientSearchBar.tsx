'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import Popper from '@mui/material/Popper'
import List from '@mui/material/List'
import { alpha } from '@mui/material/styles'

// Icon Imports
import SearchIcon from '@mui/icons-material/Search'
import PhoneIcon from '@mui/icons-material/Phone'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

// Context Imports
import { useTranslation } from '@/contexts/translationContext'

// Types
type Patient = {
  id: number
  name: string
  phone_number: string | null
}

const PatientSearchBar = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const searchInputRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientSelect = (patientId: number) => {
    const lang = params?.lang || 'en'
    router.push(`/${lang}/apps/patient/view/${patientId}`)
    setShowResults(false)
    setSearchQuery('')
  }

  return (
    <Box
      ref={searchContainerRef}
      sx={{
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        position: 'relative'
      }}
    >
      <Paper
        ref={searchInputRef}
        elevation={3}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          borderRadius: '24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 6
          },
          bgcolor: 'background.paper'
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label='search'>
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={t('patient.searchPlaceholder')}
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          inputProps={{ 'aria-label': 'search patients' }}
        />
        {isLoading && (
          <Box sx={{ p: '10px' }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Paper>

      <Popper
        open={showResults && searchResults.length > 0}
        anchorEl={searchInputRef.current}
        placement='bottom-start'
        transition
        style={{ width: searchInputRef.current?.offsetWidth }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 8
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={8}
              sx={{
                width: '100%',
                maxHeight: '400px',
                overflow: 'auto',
                borderRadius: '16px',
                bgcolor: 'background.paper',
                '&::-webkit-scrollbar': {
                  width: '4px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '2px'
                }
              }}
            >
              <List sx={{ width: '100%', p: 0.5 }}>
                {searchResults.map(patient => (
                  <Box
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient.id)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      borderRadius: '8px',
                      '&:hover': {
                        bgcolor: theme => alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant='body1'
                        sx={{
                          color: 'text.primary',
                          fontWeight: 400,
                          mb: 0.5
                        }}
                        noWrap
                      >
                        {patient.name}
                      </Typography>
                      {patient.phone_number && (
                        <Typography
                          variant='body2'
                          sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.75rem',
                            opacity: 0.7
                          }}
                          noWrap
                        >
                          <PhoneIcon sx={{ fontSize: '0.75rem' }} />
                          {patient.phone_number}
                        </Typography>
                      )}
                    </Box>
                    <ArrowForwardIosIcon
                      sx={{
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        opacity: 0.5,
                        ml: 1
                      }}
                    />
                  </Box>
                ))}
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  )
}

export default PatientSearchBar
