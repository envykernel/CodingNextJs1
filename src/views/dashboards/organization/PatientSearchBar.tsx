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
  id: string
  name: string
  email: string
  phone: string
}

type Invoice = {
  id: string
  invoice_number: string
  patient_name: string
  total_amount: number
  payment_status: string
  record_status: string
  invoice_date: string
}

type Visit = {
  id: string
  visit_date: string
  start_time: string
  end_time: string
  status: string
  patient: Patient
  doctor?: {
    id: string
    name: string
  }
  appointment?: {
    id: string
    appointment_type: string
  }
}

type SearchType = 'patient' | 'invoice' | 'visit'

type SearchResult = Patient | Invoice | Visit

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
        // For invoice or visit search, get data for the found patients
        const patientIds = patientData.map((p: Patient) => p.id)
        if (patientIds.length > 0) {
          const endpoint = searchType === 'invoice' ? 'invoices' : 'visits'
          const searchResponse = await fetch(`/api/${endpoint}/search?patientIds=${patientIds.join(',')}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (!searchResponse.ok) {
            if (searchResponse.status === 401) {
              // Handle unauthorized - redirect to login
              router.push(`/${params?.lang || 'en'}/login`)
              return
            }
            const errorText = await searchResponse.text()
            console.error(`${searchType} search failed:`, errorText)
            throw new Error(`${searchType} search failed`)
          }

          const data = await searchResponse.json()
          setSearchResults(data)
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

  const handleSelect = async (result: SearchResult) => {
    let loadingMessage = ''
    if (searchType === 'patient') {
      loadingMessage = t('loading.navigatingToPatient')
    } else if (searchType === 'invoice') {
      loadingMessage = t('loading.navigatingToInvoice')
    } else {
      loadingMessage = t('loading.navigatingToVisits')
    }

    dispatch(setLoading({ isLoading: true, message: loadingMessage }))
    try {
      if (searchType === 'patient') {
        await router.push(`/${params?.lang || 'en'}/apps/patient/view/${result.id}`)
      } else if (searchType === 'invoice') {
        await router.push(`/${params?.lang || 'en'}/apps/invoice/preview/${result.id}`)
      } else if (searchType === 'visit') {
        await router.push(`/${params?.lang || 'en'}/apps/visits/view/${result.id}`)
      }
    } catch (error) {
      console.error('Navigation error:', error)
      dispatch(setLoading({ isLoading: false, message: '' }))
    }
  }

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type)
    setSearchResults([])
    setShowResults(false)
    setSearchQuery('')
  }

  const isPatient = (result: SearchResult): result is Patient => {
    return 'email' in result && 'phone' in result
  }

  const isInvoice = (result: SearchResult): result is Invoice => {
    return 'invoice_number' in result && 'total_amount' in result
  }

  const isVisit = (result: SearchResult): result is Visit => {
    return 'visit_date' in result && 'start_time' in result && 'end_time' in result
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
              placeholder={t(`search.placeholder.${searchType}`)}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery && setShowResults(true)}
              inputProps={{
                'aria-label': t(`search.aria.${searchType}`)
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
                zIndex: 2
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  maxHeight: 400,
                  overflow: 'auto',
                  bgcolor: 'background.paper'
                }}
              >
                <List>
                  {searchResults.length > 0 ? (
                    searchResults.map(item => (
                      <Box
                        key={item.id}
                        sx={{
                          px: 2,
                          py: 1.5,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: theme => alpha(theme.palette.primary.main, 0.08)
                          }
                        }}
                        onClick={() => handleSelect(item)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {searchType === 'invoice' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='tabler-file-invoice text-lg text-primary' />
                                <Box>
                                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                    {(item as Invoice).invoice_number} - {(item as Invoice).patient_name}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {new Date((item as Invoice).invoice_date).toLocaleDateString()} •{' '}
                                    {t(`invoice.paymentStatus.${(item as Invoice).payment_status.toLowerCase()}`)}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : searchType === 'visit' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='tabler-clipboard-check text-lg text-primary' />
                                <Box>
                                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                    {(item as Visit).patient.name} -{' '}
                                    {new Date((item as Visit).visit_date).toLocaleDateString()}{' '}
                                    {(item as Visit).start_time} - {(item as Visit).end_time}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {(() => {
                                      const appointmentType = (item as Visit).appointment?.appointment_type
                                      const visitStatus = (item as Visit).status
                                      const typeText = appointmentType
                                        ? t(`appointment.types.${appointmentType.toLowerCase().replace(/\s+/g, '_')}`)
                                        : t('common.noType')
                                      const statusText = t(`visit.status.${visitStatus}`)
                                      return `${typeText} • ${statusText}`
                                    })()}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon fontSize='small' color='primary' />
                                <Box>
                                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                    {(item as Patient).name}
                                    {(item as Patient).phone && ` - ${(item as Patient).phone}`}
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
          <Tooltip title={t('search.type.visit')}>
            <IconButton
              onClick={() => handleSearchTypeChange('visit')}
              sx={{
                width: 40,
                height: 40,
                color: searchType === 'visit' ? 'primary.main' : 'text.secondary',
                bgcolor: searchType === 'visit' ? theme => alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.12)
                }
              }}
            >
              <i className='tabler-clipboard-check text-xl' />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

export default PatientSearchBar
