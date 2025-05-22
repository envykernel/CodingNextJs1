'use client'

// Next.js Imports
import { useState } from 'react'

import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

// React Imports

// Third-party Imports
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import classnames from 'classnames'

// MUI Imports
import { Card, Grid, Typography, TextField, IconButton, InputAdornment, Button, Chip } from '@mui/material'
import TablePagination from '@mui/material/TablePagination'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Hook Imports
import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

interface User {
  id: string
  name: string
  email: string
  role: string
  organisationName: string
  status: 'active' | 'inactive'
}

interface UsersManagementProps {
  usersData: User[]
  page: number
  pageSize: number
  total: number
}

// Add role configuration
const roleConfig = {
  ADMIN: {
    color: 'error',
    icon: 'tabler-crown',
    label: 'Administrator'
  },
  DOCTOR: {
    color: 'primary',
    icon: 'tabler-stethoscope',
    label: 'Doctor'
  },
  NURSE: {
    color: 'info',
    icon: 'tabler-heartbeat',
    label: 'Nurse'
  },
  RECEPTIONIST: {
    color: 'success',
    icon: 'tabler-calendar-event',
    label: 'Receptionist'
  },
  ACCOUNTANT: {
    color: 'warning',
    icon: 'tabler-calculator',
    label: 'Accountant'
  },
  LAB_TECHNICIAN: {
    color: 'secondary',
    icon: 'tabler-microscope',
    label: 'Lab Technician'
  },
  PHARMACIST: {
    color: 'error',
    icon: 'tabler-pill',
    label: 'Pharmacist'
  },
  USER: {
    color: 'success',
    icon: 'tabler-user',
    label: 'User'
  }
} as const

// Add status configuration
const statusConfig = {
  active: {
    color: 'success',
    icon: 'tabler-circle-check'
  },
  inactive: {
    color: 'error',
    icon: 'tabler-circle-x'
  }
} as const

const UsersManagement = ({ usersData, page, pageSize, total }: UsersManagementProps) => {
  const router = useRouter()
  const { t } = useTranslation()
  const translate = (key: string) => t(`usersManagement.${key}`)

  const [searchValue, setSearchValue] = useState('')

  const [paginationModel, setPaginationModel] = useState({
    pageIndex: page - 1,
    pageSize
  })

  const columnHelper = createColumnHelper<User>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: translate('columns.name'),
        cell: info => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(info.getValue())}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {info.getValue()}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {info.row.original.email}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('role', {
        header: translate('columns.role'),
        cell: info => {
          const role = info.getValue() as keyof typeof roleConfig
          const roleInfo = roleConfig[role]

          return (
            <div className='flex items-center gap-2'>
              <i className={roleInfo.icon} style={{ color: `var(--mui-palette-${roleInfo.color}-main)` }} />
              <Typography color='text.primary'>{translate(`roles.${role}`)}</Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('organisationName', {
        header: translate('columns.organisation'),
        cell: info => (
          <div className='flex items-center gap-2'>
            <i className='tabler-building text-textSecondary' />
            <Typography color='text.primary'>{info.getValue()}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: translate('columns.status'),
        cell: info => {
          const status = info.getValue() as keyof typeof statusConfig
          const statusInfo = statusConfig[status]

          return (
            <Chip
              variant='tonal'
              label={translate(`status.${status}`)}
              size='small'
              color={statusInfo.color}
              icon={<i className={statusInfo.icon} />}
              className='capitalize'
            />
          )
        }
      }),
      columnHelper.accessor('id', {
        header: translate('columns.actions'),
        cell: info => (
          <div className='flex items-center gap-2'>
            <IconButton
              onClick={() => router.push(`/users/${info.getValue()}/edit`)}
              aria-label={translate('actions.edit')}
              size='small'
              color='primary'
              className='hover:bg-primary/10'
            >
              <i className='tabler-edit text-lg' />
            </IconButton>
            <IconButton
              onClick={() => router.push(`/users/${info.getValue()}/view`)}
              aria-label={translate('actions.view')}
              size='small'
              color='info'
              className='hover:bg-info/10'
            >
              <i className='tabler-eye text-lg' />
            </IconButton>
          </div>
        )
      })
    ],
    [translate, router]
  )

  const table = useReactTable({
    data: usersData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      pagination: paginationModel,
      globalFilter: searchValue
    },
    onPaginationChange: setPaginationModel,
    onGlobalFilterChange: setSearchValue,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: fuzzyFilter
  })

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Grid container spacing={6} sx={{ p: 5 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant='h5'>{translate('title')}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <TextField
                size='small'
                value={searchValue}
                onChange={handleSearch}
                placeholder={translate('searchPlaceholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  )
                }}
                sx={{ mr: 4 }}
              />
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => router.push('/users/new')}
              >
                {translate('addUser')}
              </Button>
            </Grid>
          </Grid>

          <div className={classnames(tableStyles.tableWrapper, { [tableStyles.tableBelow]: true })}>
            <table className={classnames(tableStyles.table, 'hover:bg-action-hover')}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className='bg-action-hover'>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className={classnames({
                          'cursor-pointer select-none': header.column.getCanSort(),
                          'hover:bg-action-hover': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className='flex items-center gap-2'>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className='flex flex-col'>
                              <i
                                className={classnames('tabler-chevron-up text-xs', {
                                  'text-primary': header.column.getIsSorted() === 'asc',
                                  'text-textSecondary': header.column.getIsSorted() !== 'asc'
                                })}
                              />
                              <i
                                className={classnames('tabler-chevron-down text-xs', {
                                  'text-primary': header.column.getIsSorted() === 'desc',
                                  'text-textSecondary': header.column.getIsSorted() !== 'desc'
                                })}
                              />
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center py-8'>
                      <div className='flex flex-col items-center gap-2'>
                        <i className='tabler-users-off text-4xl text-textSecondary' />
                        <Typography color='text.secondary'>{translate('noUsers')}</Typography>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className='transition-colors hover:bg-action-hover'>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            component='div'
            count={total}
            page={table.getState().pagination.pageIndex}
            rowsPerPage={table.getState().pagination.pageSize}
            onPageChange={(_, page) => table.setPageIndex(page)}
            onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              borderTop: '1px solid var(--border-color)',
              '.MuiTablePagination-select': {
                minWidth: '2rem !important'
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default UsersManagement
