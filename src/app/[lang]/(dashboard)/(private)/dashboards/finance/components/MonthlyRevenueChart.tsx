'use client'

import { useEffect, useState, useRef } from 'react'

import { useSession } from 'next-auth/react'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Popper from '@mui/material/Popper'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import MenuList from '@mui/material/MenuList'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TableSortLabel from '@mui/material/TableSortLabel'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import { getMonthlyRevenueData } from '../actions'

type InvoiceData = {
  invoiceNumber: string
  date: Date
  totalAmount: number
  paidAmount: number
  paidPercentage: number
  status: string
  patientName: string
}

type Period = 'This Week' | 'This Month' | 'This Year'

type MonthlyRevenueData = {
  invoices: InvoiceData[]
  totalInvoiced: number
  totalPaid: number
  growth: number
  previousPeriodPaid: number
  period: Period
  comparisonType: 'average_monthly' | 'previous_period'
}

type SortField = 'date' | 'invoiceNumber' | 'totalAmount' | 'paidAmount' | 'paidPercentage' | 'status' | 'patientName'
type SortOrder = 'asc' | 'desc'

const MonthButton = ({ period, onPeriodChange }: { period: Period; onPeriodChange: (period: Period) => void }) => {
  const [open, setOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLDivElement | null>(null)

  const options: Period[] = ['This Week', 'This Month', 'This Year']

  const handleMenuItemClick = (event: React.MouseEvent<HTMLLIElement>, index: number) => {
    onPeriodChange(options[index])
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <ButtonGroup variant='tonal' ref={anchorRef} aria-label='split button' size='small'>
        <Button>{period}</Button>
        <Button
          className='pli-0 plb-[5px]'
          aria-haspopup='menu'
          onClick={handleToggle}
          aria-label='select time range'
          aria-expanded={open ? 'true' : undefined}
          aria-controls={open ? 'split-button-menu' : undefined}
        >
          <i className='tabler-chevron-down text-xl' />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition placement='bottom-end'>
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu'>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={option === period}
                      onClick={event => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

const StatusFilterButton = ({ status, active, onClick }: { status: string; active: boolean; onClick: () => void }) => {
  const theme = useTheme()

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'primary' => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PARTIAL':
        return 'warning'
      case 'PENDING':
        return 'error'
      default:
        return 'primary'
    }
  }

  const getStatusStyle = (status: string) => {
    const color = getStatusColor(status)
    const isActive = active

    return {
      minWidth: 100,
      height: 32,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      border: `1px solid ${isActive ? theme.palette[color].main : theme.palette.divider}`,
      backgroundColor: isActive ? theme.palette[color].main : 'transparent',
      color: isActive ? theme.palette[color].contrastText : theme.palette.text.secondary,
      '&:hover': {
        backgroundColor: isActive ? theme.palette[color].dark : theme.palette.action.hover,
        borderColor: theme.palette[color].main,
        color: isActive ? theme.palette[color].contrastText : theme.palette.text.primary
      },
      '&:active': {
        backgroundColor: theme.palette[color].dark,
        color: theme.palette[color].contrastText
      }
    }
  }

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      sx={getStatusStyle(status)}
      startIcon={
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: active ? theme.palette[getStatusColor(status)].contrastText : theme.palette.text.disabled,
            mr: 1
          }}
        />
      }
    >
      {status}
    </Button>
  )
}

const MonthlyRevenueChart = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const [data, setData] = useState<MonthlyRevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('This Month')

  // Table state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (session?.user?.organisationId) {
        try {
          setLoading(true)
          setError(null)
          const result = await getMonthlyRevenueData(Number(session.user.organisationId), period)

          if (isMounted) {
            setData(result)
          }
        } catch (error) {
          console.error('Error fetching monthly revenue data:', error)

          if (isMounted) {
            setError('Failed to load monthly revenue data')
            setData(null)
          }
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [session?.user?.organisationId, period])

  // Format currency helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'MAD',
      currencyDisplay: 'code'
    })
  }

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get status color
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PARTIAL':
        return 'warning'
      case 'PENDING':
        return 'error'
      default:
        return 'error'
    }
  }

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc'

    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortField(field)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setPage(0)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setPage(0)
  }

  // Filter and sort data
  const filteredData =
    data?.invoices.filter(invoice => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDate(invoice.date).toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    }) || []

  const sortedData = [...filteredData].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1

    switch (sortField) {
      case 'date':
        return multiplier * (a.date.getTime() - b.date.getTime())
      case 'invoiceNumber':
        return multiplier * a.invoiceNumber.localeCompare(b.invoiceNumber)
      case 'totalAmount':
        return multiplier * (a.totalAmount - b.totalAmount)
      case 'paidAmount':
        return multiplier * (a.paidAmount - b.paidAmount)
      case 'paidPercentage':
        return multiplier * (a.paidPercentage - b.paidPercentage)
      case 'status':
        return multiplier * a.status.localeCompare(b.status)
      case 'patientName':
        return multiplier * a.patientName.localeCompare(b.patientName)
      default:
        return 0
    }
  })

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const renderContent = () => {
    if (loading) {
      return (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
          <CircularProgress />
        </Box>
      )
    }

    if (error) {
      return (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
          <Typography color='error'>{error}</Typography>
        </Box>
      )
    }

    if (!data || data.invoices.length === 0) {
      return (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
          <Typography color='text.secondary'>No invoice data available for {period.toLowerCase()}</Typography>
        </Box>
      )
    }

    return (
      <>
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size='small'
            placeholder='Search invoices or patients...'
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='tabler-search text-xl' />
                </InputAdornment>
              )
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map(status => (
              <StatusFilterButton
                key={status}
                status={status}
                active={statusFilter === status}
                onClick={() => handleStatusFilterChange(status)}
              />
            ))}
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'date'}
                    direction={sortField === 'date' ? sortOrder : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'invoiceNumber'}
                    direction={sortField === 'invoiceNumber' ? sortOrder : 'asc'}
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    Invoice #
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'patientName'}
                    direction={sortField === 'patientName' ? sortOrder : 'asc'}
                    onClick={() => handleSort('patientName')}
                  >
                    Patient
                  </TableSortLabel>
                </TableCell>
                <TableCell align='right'>
                  <TableSortLabel
                    active={sortField === 'totalAmount'}
                    direction={sortField === 'totalAmount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('totalAmount')}
                  >
                    Total Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell align='right'>
                  <TableSortLabel
                    active={sortField === 'paidAmount'}
                    direction={sortField === 'paidAmount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('paidAmount')}
                  >
                    Paid Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'paidPercentage'}
                    direction={sortField === 'paidPercentage' ? sortOrder : 'asc'}
                    onClick={() => handleSort('paidPercentage')}
                  >
                    Progress
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'status'}
                    direction={sortField === 'status' ? sortOrder : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map(invoice => (
                <TableRow key={invoice.invoiceNumber} hover>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.patientName}</TableCell>
                  <TableCell align='right'>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell align='right'>{formatCurrency(invoice.paidAmount)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant='determinate'
                        value={invoice.paidPercentage}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette[getStatusColor(invoice.status)].main
                          }
                        }}
                      />
                      <Typography variant='caption' color='text.secondary' sx={{ minWidth: 45 }}>
                        {invoice.paidPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={invoice.status}
                      color={getStatusColor(invoice.status)}
                      sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component='div'
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </>
    )
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader
          title='Invoice Payments'
          subheader={
            <Typography variant='body2' color='text.secondary'>
              {`Total paid: ${formatCurrency(data?.totalPaid || 0)} of ${formatCurrency(data?.totalInvoiced || 0)}`}
            </Typography>
          }
          action={<MonthButton period={period} onPeriodChange={setPeriod} />}
        />
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </Grid>
  )
}

export default MonthlyRevenueChart
