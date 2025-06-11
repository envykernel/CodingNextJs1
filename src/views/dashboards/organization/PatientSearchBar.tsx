'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'

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

type SearchType = 'patient' | 'invoice'

type SearchResult = Patient | Invoice

const PatientSearchBar = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useParams<{ lang: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('patient')
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
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

  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)
    setShowResults(false) // Reset show results before new search

    try {
      // Always search patients first
      const patientResponse = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!patientResponse.ok) {
        if (patientResponse.status === 401) {
          // Handle unauthorized - redirect to login
          router.push(`/${params?.lang || 'en'}/login`)
          return
        }
        const errorText = await patientResponse.text()
        console.error('Patient search failed:', errorText)
        throw new Error('Patient search failed')
      }

      const patientData = await patientResponse.json()

      if (searchType === 'patient') {
        setSearchResults(patientData)
        setShowResults(true) // Show results after setting them
      } else {
        // For invoice search, get invoices for the found patients
        const patientIds = patientData.map((p: Patient) => p.id)
        if (patientIds.length > 0) {
          const invoiceResponse = await fetch(`/api/invoices/search?patientIds=${patientIds.join(',')}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (!invoiceResponse.ok) {
            if (invoiceResponse.status === 401) {
              // Handle unauthorized - redirect to login
              router.push(`/${params?.lang || 'en'}/login`)
              return
            }
            const errorText = await invoiceResponse.text()
            console.error('Invoice search failed:', errorText)
            throw new Error('Invoice search failed')
          }

          const invoiceData = await invoiceResponse.json()
          setSearchResults(invoiceData)
          setShowResults(true) // Show results after setting them
        } else {
          setSearchResults([])
          setShowResults(true) // Show empty results
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setShowResults(true) // Show empty results even on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = async (item: SearchResult) => {
    const lang = params?.lang || 'en'
    const message = searchType === 'patient' ? t('loading.navigatingToPatient') : t('loading.navigatingToInvoice')

    // Set loading state before navigation
    dispatch(setLoading({ isLoading: true, message }))
    setShowResults(false)
    setSearchQuery('')

    try {
      if (searchType === 'patient') {
        await router.push(`/${lang}/apps/patient/view/${item.id}`)
      } else {
        await router.push(`/${lang}/apps/invoice/preview/${(item as Invoice).id}`)
      }
    } catch (error) {
      console.error('Navigation error:', error)
      // Only clear loading state if navigation fails
      dispatch(setLoading({ isLoading: false }))
    }
    // Note: We don't clear loading state here anymore
    // The GlobalLoading component will handle clearing the state when the component unmounts
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
        <Box sx={{ position: 'relative', flex: 1 }}>
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
              bgcolor: 'background.paper',
              position: 'relative',
              zIndex: 1
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label='search' onClick={handleSearch} disabled={isLoading}>
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                pr: 3
              }}
              placeholder={searchType === 'patient' ? t('search.placeholder.patient') : t('search.placeholder.invoice')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery && setShowResults(true)}
              inputProps={{
                'aria-label': searchType === 'patient' ? t('search.aria.patient') : t('search.aria.invoice')
              }}
              endAdornment={
                isLoading && (
                  <InputAdornment position='end' sx={{ mr: 1 }}>
                    <CircularProgress size={20} color='primary' />
                  </InputAdornment>
                )
              }
            />
          </Paper>

          {showResults && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                zIndex: 1300
              }}
            >
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
                  {searchResults.length > 0 ? (
                    searchResults.map(item => (
                      <Box
                        key={item.id}
                        onClick={() => handleSelect(item)}
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
                    ))
                  ) : (
                    <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        {t('search.noResults')}
                      </Typography>
                    </Box>
                  )}
                </List>
              </Paper>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t('search.type.patient')}>
            <IconButton
              onClick={() => handleSearchTypeChange('patient')}
              sx={{
                width: 40,
                height: 40,
                color: searchType === 'patient' ? 'primary.main' : 'text.secondary',
                bgcolor:
                  searchType === 'patient' ? theme => alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
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
              onClick={() => handleSearchTypeChange('invoice')}
              sx={{
                width: 40,
                height: 40,
                color: searchType === 'invoice' ? 'primary.main' : 'text.secondary',
                bgcolor:
                  searchType === 'invoice' ? theme => alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.12)
                }
              }}
            >
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

export default PatientSearchBar
