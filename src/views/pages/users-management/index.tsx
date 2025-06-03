'use client'

// Next.js Imports
import { useState } from 'react'
import { useMemo } from 'react'

import React from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

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
import {
  Card,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import TablePagination from '@mui/material/TablePagination'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

// Style Imports
import type { UserRole } from '@prisma/client'

import tableStyles from '@core/styles/table.module.css'

// Hook Imports
import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import UserDrawer, { type UserFormData } from './UserDrawer'

// Util Imports
// Server Action Imports
import { createUser, updateUser, deleteUser } from '@/app/server/userActions'

// Type Imports

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
  role: UserRole | null
  organisationName: string
  isApproved: boolean
  organisationId: number | null
  createdAt: Date
  updatedAt?: Date
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
  DOCTOR_MANAGER: {
    color: 'primary',
    icon: 'tabler-building-hospital',
    label: 'Doctor Manager'
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

const UsersManagement = ({ usersData, page, pageSize, total }: UsersManagementProps) => {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: session } = useSession()
  const translate = (key: string) => t(`usersManagement.${key}`)
  const translateConfirmation = (key: string) => t(`userDrawer.confirmation.${key}`)

  const isAdmin = session?.user?.role === 'ADMIN'
  const userOrgId = Number(session?.user?.organisationId)

  const [searchValue, setSearchValue] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [paginationModel, setPaginationModel] = useState({
    pageIndex: page - 1,
    pageSize
  })

  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const columnHelper = createColumnHelper<User>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: translate('columns.name'),
        cell: info => (
          <Typography className='font-medium' color='text.primary'>
            {info.getValue()}
          </Typography>
        )
      }),
      columnHelper.accessor('email', {
        header: translate('columns.email'),
        cell: info => <Typography color='text.primary'>{info.getValue()}</Typography>
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
      columnHelper.accessor('isApproved', {
        header: translate('columns.status'),
        cell: info => {
          const isApproved = info.getValue()

          return (
            <Chip
              variant='tonal'
              label={isApproved ? translate('status.approved') : translate('status.pending')}
              size='small'
              color={isApproved ? 'success' : 'warning'}
              icon={<i className={isApproved ? 'tabler-circle-check' : 'tabler-clock'} />}
              className='capitalize'
            />
          )
        }
      }),
      columnHelper.accessor('id', {
        header: translate('columns.actions'),
        cell: info => (
          <div className='flex items-center gap-2'>
            {isAdmin && (
              <>
                <Button
                  onClick={() => handleEditUser(info.row.original)}
                  size='small'
                  color='primary'
                  variant='text'
                  startIcon={<i className='tabler-edit' />}
                >
                  {translate('actions.edit')}
                </Button>
                <Button
                  onClick={() => handleDeleteClick(info.row.original)}
                  size='small'
                  color='error'
                  variant='text'
                  startIcon={<i className='tabler-trash' />}
                >
                  {translate('actions.delete')}
                </Button>
              </>
            )}
          </div>
        )
      })
    ],
    [translate, router, isAdmin]
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

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setDrawerOpen(true)
  }

  const handleEditUser = (user: User) => {
    console.log('Editing user - Full user data:', user)
    console.log('isApproved value:', user.isApproved, 'type:', typeof user.isApproved)
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const handleSubmitUser = async (data: UserFormData) => {
    try {
      if (!isAdmin) {
        throw new Error('Not authorized')
      }

      // Ensure we're using the current user's organization
      const userData = {
        ...data,
        organisationId: userOrgId
      }

      if (selectedUser) {
        const result = await updateUser({ id: selectedUser.id, ...userData })

        if (result.success) {
          router.refresh()
        }
      } else {
        const result = await createUser(userData)

        if (result.success) {
          router.refresh()
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error)

      // Handle specific error messages
      if (error.message.includes('organization')) {
        throw new Error(translate('errors.organizationAccess'))
      } else if (error.message.includes('Not authorized')) {
        throw new Error(translate('errors.notAuthorized'))
      } else {
        throw new Error(translate('errors.generic'))
      }
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      const result = await deleteUser(userToDelete.id)

      if (result.success) {
        setNotification({
          open: true,
          message: translate('success.userDeleted'),
          severity: 'success'
        })
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      setNotification({
        open: true,
        message: error.message || translate('errors.generic'),
        severity: 'error'
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
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
              {isAdmin && (
                <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAddUser}>
                  {translate('addUser')}
                </Button>
              )}
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
            labelRowsPerPage={translate('pagination.rowsPerPage')}
            labelDisplayedRows={({ from, to, count }) =>
              `${translate('pagination.showing')} ${from}-${to} ${translate('pagination.of')} ${count}`
            }
            sx={{
              borderTop: '1px solid var(--border-color)',
              '.MuiTablePagination-select': {
                minWidth: '2rem !important'
              }
            }}
          />
        </Card>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {isAdmin && (
        <UserDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSubmit={handleSubmitUser}
          user={selectedUser}
          organisationId={userOrgId}
        />
      )}

      {/* Add Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} aria-labelledby='delete-user-dialog-title'>
        <DialogTitle id='delete-user-dialog-title' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color='error' sx={{ fontSize: 28 }} />
          {translateConfirmation('deleteUser.title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='subtitle1' color='error' sx={{ mb: 2 }}>
            {translateConfirmation('deleteUser.warning')}
          </Typography>
          <DialogContentText sx={{ mb: 2 }}>
            {translateConfirmation('deleteUser.message')
              .split('{name}')
              .map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <Typography component='span' sx={{ fontWeight: 'bold' }}>
                      {userToDelete?.name || ''}
                    </Typography>
                  )}
                </React.Fragment>
              ))}
          </DialogContentText>
          <DialogContentText color='text.secondary'>
            {translateConfirmation('deleteUser.description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary'>
            {translateConfirmation('deleteUser.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained' autoFocus>
            {translateConfirmation('deleteUser.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default UsersManagement
