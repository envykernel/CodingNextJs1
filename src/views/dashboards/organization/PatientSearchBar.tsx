'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'

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
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// Icon Imports
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PhoneIcon from '@mui/icons-material/Phone'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import EventNoteIcon from '@mui/icons-material/EventNote'

// Context Imports
import { useTranslation } from '@/contexts/translationContext'

// Redux Imports
import { setLoading } from '@/redux-store/slices/loading'

// Types
type Patient = {
  id: number
  name: string
  phone_number: string | null
}

type Invoice = {
  id: number
  invoice_number: string
  patient_id: number
  patient_name: string
  amount: number
  status: string
}

type Visit = {
  id: number
  patient_id: number
  patient_name: string
  date: string
  status: string
  type: string
}

type SearchType = 'patient' | 'invoice' | 'visit'

type SearchResult = Patient | Invoice | Visit

const PatientSearchBar = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useParams<{ lang: string }>()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('patient')
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const searchInputRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const organisationId = session?.user?.organisationId

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

  const handleSearch = async () => {
    if (!searchQuery.trim() || !organisationId) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setSearchResults([])
    setError(null)

    try {
      // First, search for patients
      const patientsResponse = await fetch(
        `/api/patients/search?query=${encodeURIComponent(searchQuery)}&organisationId=${organisationId}`
      )

      if (!patientsResponse.ok) {
        if (patientsResponse.status === 401) {
          router.push(`/${params?.lang || 'en'}/auth/login`)
          return
        }
        throw new Error('Failed to search patients')
      }

      const patientsData = await patientsResponse.json()
      const patientIds = patientsData.map((patient: any) => patient.id)

      if (patientIds.length === 0) {
        setSearchResults([])
        return
      }

      // If searching for invoices or visits, fetch those as well
      if (searchType === 'invoice' || searchType === 'visit') {
        const endpoint = searchType === 'invoice' ? 'invoices' : 'visits'
        const idsParam = searchType === 'invoice' ? 'patientId' : 'patientIds'
        const idsValue = patientIds.join(',')

        const response = await fetch(`/api/${endpoint}/search?${idsParam}=${encodeURIComponent(idsValue)}`)

        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/${params?.lang || 'en'}/auth/login`)
            return
          }
          throw new Error(`Failed to search ${endpoint}`)
        }

        const data = await response.json()
        setSearchResults(data)
      } else {
        setSearchResults(patientsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = async (result: any) => {
    setIsLoading(true)
    try {
      let url = ''
      if (searchType === 'patient') {
        url = `/${params?.lang || 'en'}/apps/patients/view/${result.id}`
      } else if (searchType === 'invoice') {
        url = `/${params?.lang || 'en'}/apps/invoices/view/${result.id}`
      } else if (searchType === 'visit') {
        url = `/${params?.lang || 'en'}/apps/visits/view/${result.id}`
      }

      if (url) {
        router.push(url)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type)
    setSearchResults([])
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
          placeholder={
            searchType === 'patient'
              ? t('search.placeholder.patient')
              : searchType === 'invoice'
                ? t('search.placeholder.invoice')
                : t('search.placeholder.visit')
          }
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          inputProps={{
            'aria-label':
              searchType === 'patient'
                ? t('search.aria.patient')
                : searchType === 'invoice'
                  ? t('search.aria.invoice')
                  : t('search.aria.visit')
          }}
          endAdornment={
            isLoading && (
              <InputAdornment position='end'>
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
          <Tooltip title={t('search.type.patient')}>
            <IconButton
              size='small'
              onClick={() => handleSearchTypeChange('patient')}
              sx={{
                color: searchType === 'patient' ? 'primary.main' : 'text.secondary',
                bgcolor: searchType === 'patient' ? theme => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.12)
                }
              }}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('search.type.invoice')}>
            <IconButton
              size='small'
              onClick={() => handleSearchTypeChange('invoice')}
              sx={{
                color: searchType === 'invoice' ? 'primary.main' : 'text.secondary',
                bgcolor: searchType === 'invoice' ? theme => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.12)
                }
              }}
            >
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('search.type.visit')}>
            <IconButton
              size='small'
              onClick={() => handleSearchTypeChange('visit')}
              sx={{
                color: searchType === 'visit' ? 'primary.main' : 'text.secondary',
                bgcolor: searchType === 'visit' ? theme => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.12)
                }
              }}
            >
              <EventNoteIcon />
            </IconButton>
          </Tooltip>
        </Box>
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
                {searchResults.map(item => (
                  <Box
                    key={item.id}
                    onClick={() => handleResultClick(item)}
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
                      {searchType === 'invoice' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ReceiptIcon fontSize='small' color='primary' />
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {(item as Invoice).invoice_number} - {(item as Invoice).patient_name}
                            </Typography>
                          </Box>
                        </Box>
                      ) : searchType === 'visit' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventNoteIcon fontSize='small' color='primary' />
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {(item as Visit).patient_name} - {new Date((item as Visit).date).toLocaleDateString()}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {(item as Visit).type} - {(item as Visit).status}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize='small' color='primary' />
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {(item as Patient).name}
                              {(item as Patient).phone_number && ` - ${(item as Patient).phone_number}`}
                            </Typography>
                          </Box>
                        </Box>
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
