'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { InvoiceType } from '@/types/apps/invoiceTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import { useTranslation } from '@/contexts/translationContext'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type InvoiceTypeWithAction = InvoiceType & {
  action?: string
}

type InvoiceStatusObj = {
  [key: string]: {
    icon: string
    color: ThemeColor
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

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Vars
const invoicePaymentStatusObj: InvoiceStatusObj = {
  PAID: { color: 'success', icon: 'tabler-check' },
  PARTIAL: { color: 'warning', icon: 'tabler-chart-pie-2' },
  PENDING: { color: 'error', icon: 'tabler-alert-circle' }
}

const invoiceRecordStatusObj: InvoiceStatusObj = {
  ACTIVE: { color: 'primary', icon: 'tabler-file-invoice' },
  ARCHIVED: { color: 'info', icon: 'tabler-archive' },
  DELETED: { color: 'error', icon: 'tabler-trash' }
}

// Column Definitions
const columnHelper = createColumnHelper<InvoiceTypeWithAction>()

const InvoiceListTable = ({ invoiceData }: { invoiceData?: InvoiceType[] }) => {
  // States
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [recordStatus, setRecordStatus] = useState<string>('')
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<InvoiceType[]>(invoiceData || [])
  const [filteredData, setFilteredData] = useState<InvoiceType[]>(invoiceData || [])
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const params = useParams()
  const locale = params?.lang as Locale
  const { t } = useTranslation()

  // Update data when invoiceData changes
  useEffect(() => {
    setData(invoiceData || [])
    setFilteredData(invoiceData || [])
  }, [invoiceData])

  const columns = useMemo<ColumnDef<InvoiceTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('invoice_number', {
        header: '#',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/invoice/preview/${row.original.id}`, locale)}
            color='primary.main'
          >
            {row.original.invoice_number}
          </Typography>
        )
      }),
      columnHelper.accessor('payment_status', {
        header: t('invoice.paymentStatus.label'),
        cell: ({ row }) => {
          const statusObj = invoicePaymentStatusObj[row.original.payment_status] || {
            color: 'default',
            icon: 'tabler-file-invoice'
          }

          return (
            <Tooltip
              title={
                <div>
                  <Typography variant='body2' component='span' className='text-inherit'>
                    {t('invoice.balance')}: {row.original.balance}
                  </Typography>
                  <br />
                  <Typography variant='body2' component='span' className='text-inherit'>
                    {t('invoice.date')}: {row.original.dueDate}
                  </Typography>
                </div>
              }
            >
              <Chip
                label={t(`invoice.paymentStatus.${row.original.payment_status.toLowerCase()}`)}
                color={statusObj.color}
                size='small'
                variant='tonal'
              />
            </Tooltip>
          )
        }
      }),
      columnHelper.accessor('record_status', {
        header: t('invoice.recordStatus.label'),
        cell: ({ row }) => {
          const statusObj = invoiceRecordStatusObj[row.original.record_status] || {
            color: 'default',
            icon: 'tabler-file-invoice'
          }

          return (
            <Tooltip
              title={
                <div>
                  <Typography variant='body2' component='span' className='text-inherit'>
                    {row.original.record_status === 'ARCHIVED' && row.original.archived_at
                      ? `${t('invoice.archivedAt')}: ${new Date(row.original.archived_at).toLocaleDateString()}`
                      : row.original.record_status === 'DELETED' && row.original.deleted_at
                        ? `${t('invoice.deletedAt')}: ${new Date(row.original.deleted_at).toLocaleDateString()}`
                        : ''}
                  </Typography>
                </div>
              }
            >
              <Chip
                label={t(`invoice.recordStatus.${row.original.record_status.toLowerCase()}`)}
                color={statusObj.color}
                size='small'
                variant='tonal'
              />
            </Tooltip>
          )
        }
      }),
      columnHelper.accessor('name', {
        header: t('patient.patientName'),
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: row.original.avatar, name: row.original.name })}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.companyEmail}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('total', {
        header: t('invoice.total'),
        cell: ({ row }) => <Typography>{`$${row.original.total}`}</Typography>
      }),
      columnHelper.accessor('invoice_date', {
        header: t('invoice.date'),
        cell: ({ row }) => <Typography>{row.original.invoice_date}</Typography>
      }),
      columnHelper.accessor('balance', {
        header: t('invoice.balance'),
        cell: ({ row }) => {
          const isPaid = typeof row.original.balance === 'string' && row.original.balance.replace(/\s/g, '') === '€0.00'

          return isPaid ? (
            <Chip label={t('invoice.paid')} color='success' size='small' variant='tonal' />
          ) : (
            <Typography color='text.primary'>{row.original.balance}</Typography>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: t('navigation.edit'),
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => setData(data?.filter(invoice => invoice.id !== row.original.id))}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
            <IconButton>
              <Link href={getLocalizedUrl(`/apps/invoice/preview/${row.original.id}`, locale)} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: t('invoice.download'),
                  icon: 'tabler-download',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                },
                {
                  text: t('navigation.edit'),
                  icon: 'tabler-pencil',
                  href: getLocalizedUrl(`/apps/invoice/edit/${row.original.id}`, locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
                  }
                },
                {
                  text: t('invoice.duplicate'),
                  icon: 'tabler-copy',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, filteredData, locale, t]
  )

  const table = useReactTable({
    data: filteredData as InvoiceType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = (params: Pick<InvoiceType, 'avatar' | 'name'>) => {
    const { avatar, name } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(name as string)}
        </CustomAvatar>
      )
    }
  }

  useEffect(() => {
    const filteredData = data?.filter(invoice => {
      if (paymentStatus && invoice.payment_status !== paymentStatus) return false
      if (recordStatus && invoice.record_status !== recordStatus) return false

      return true
    })

    setFilteredData(filteredData)
  }, [paymentStatus, recordStatus, data, setFilteredData])

  return (
    <Card>
      <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 is-full sm:is-auto'>
          <div className='flex items-center gap-2 is-full sm:is-auto'>
            <Typography className='hidden sm:block'>{t('common.show')}</Typography>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='is-[70px] max-sm:is-full'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
          </div>
          <Button
            variant='contained'
            component={Link}
            startIcon={<i className='tabler-plus' />}
            href={getLocalizedUrl('apps/invoice/add', locale)}
            className='max-sm:is-full'
          >
            {t('invoice.createInvoice')}
          </Button>
        </div>
        <div className='flex max-sm:flex-col max-sm:is-full sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder={t('invoice.searchInvoice')}
            className='max-sm:is-full sm:is-[250px]'
          />
          <CustomTextField
            select
            id='select-payment-status'
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value)}
            className='max-sm:is-full sm:is-[160px]'
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{t('invoice.paymentStatus.label')}</MenuItem>
            <MenuItem value='PAID'>{t('invoice.paymentStatus.paid')}</MenuItem>
            <MenuItem value='PARTIAL'>{t('invoice.paymentStatus.partial')}</MenuItem>
            <MenuItem value='PENDING'>{t('invoice.paymentStatus.pending')}</MenuItem>
          </CustomTextField>
          <CustomTextField
            select
            id='select-record-status'
            value={recordStatus}
            onChange={e => setRecordStatus(e.target.value)}
            className='max-sm:is-full sm:is-[160px]'
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{t('invoice.recordStatus.label')}</MenuItem>
            <MenuItem value='ACTIVE'>{t('invoice.recordStatus.active')}</MenuItem>
            <MenuItem value='ARCHIVED'>{t('invoice.recordStatus.archived')}</MenuItem>
            <MenuItem value='DELETED'>{t('invoice.recordStatus.deleted')}</MenuItem>
          </CustomTextField>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center p-8'>
                  <div className='flex flex-col items-center gap-2'>
                    <i className='tabler-file-invoice text-4xl text-textSecondary' />
                    <Typography variant='h6' color='text.secondary'>
                      {t('invoice.noInvoices') || 'No Invoices Found'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {t('invoice.noInvoicesDescription') || 'There are no invoices in the database yet.'}
                    </Typography>
                    <Button
                      variant='contained'
                      component={Link}
                      startIcon={<i className='tabler-plus' />}
                      href={getLocalizedUrl('apps/invoice/add', locale)}
                      className='mt-4'
                    >
                      {t('invoice.createInvoice')}
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })
            )}
          </tbody>
        </table>
      </div>
      {table.getFilteredRowModel().rows.length > 0 && (
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      )}
    </Card>
  )
}

export default InvoiceListTable
