'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

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
import type { Locale } from '@configs/i18n'

// Component Imports
import PatientTableFilters from './PatientTableFilters'
import AddPatientDrawer from './AddPatientDrawer'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import { useTranslation } from '@/contexts/translationContext'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'
import { calculateAge } from '@/utils/date'

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

// Define a PatientType for the table
export type PatientType = {
  id: number
  name: string
  birthdate: string | Date
  gender: string
  doctor?: string
  status?: string
  avatar?: string
  address?: string
  city?: string
  phone_number?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_email?: string
  created_at?: Date
  updated_at?: Date

  // Optionally add related arrays if you want to use them in the table
  // patient_measurements?: any[]
  // patient_medical?: any[]
  // patient_medical_history?: any[]
}

type PatientTypeWithAction = PatientType & { action?: string }

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
const patientStatusObj: { [key: string]: ThemeColor } = {
  enabled: 'success',
  disabled: 'secondary',
  blocked: 'error',
  pending: 'warning',
  unknown: 'secondary' // default color
}

// Column Definitions
const columnHelper = createColumnHelper<PatientTypeWithAction>()

type PatientListTableProps = {
  tableData?: PatientType[]
  page?: number
  pageSize?: number
  total?: number
}

function ClientBirthdateCell({ birthdate }: { birthdate: string | Date }) {
  const [clientDate, setClientDate] = useState('')

  useEffect(() => {
    if (birthdate) {
      setClientDate(new Date(birthdate).toLocaleDateString())
    }
  }, [birthdate])

  return <Typography>{clientDate || '-'}</Typography>
}

const PatientListTable = ({ tableData, page = 1, pageSize = 10, total = 0 }: PatientListTableProps) => {
  // States
  const [addPatientOpen, setAddPatientOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [newPatientId, setNewPatientId] = useState<number | null>(null)

  // Use mock data if tableData is not provided
  const [data, setData] = useState<PatientType[]>(
    tableData || [
      {
        id: 1,
        name: 'John Doe',
        birthdate: '1980-01-01',
        gender: 'Male',
        doctor: 'Dr. Smith',
        status: 'admitted',
        avatar: ''
      },
      {
        id: 2,
        name: 'Jane Smith',
        birthdate: '1965-05-15',
        gender: 'Female',
        doctor: 'Dr. Brown',
        status: 'underObservation',
        avatar: ''
      }
    ]
  )

  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')

  // Sync data and filteredData with tableData prop
  useEffect(() => {
    setData(tableData || [])
    setFilteredData(tableData || [])
  }, [tableData])

  // Hooks
  const params = useParams()
  const locale = params && 'lang' in params ? (params.lang as string) : 'en'
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dictionary = useTranslation()

  const columns = useMemo<ColumnDef<PatientTypeWithAction, any>[]>(() => {
    return [
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
      columnHelper.accessor('name', {
        header: 'Patient Name',
        cell: ({ row }) => {
          const isNewPatient = row.original.id === newPatientId
          const newLabel = dictionary?.patient?.newLabel || 'new'

          return (
            <div className='flex items-center gap-2'>
              {getAvatar({ avatar: row.original.avatar, fullName: row.original.name })}
              <div className='flex items-center gap-2'>
                <Typography color='text.primary' className='font-medium'>
                  {row.original.name || '-'}
                </Typography>
                {isNewPatient && (
                  <Chip
                    label={newLabel}
                    color='success'
                    size='small'
                    sx={{ fontWeight: 600, textTransform: 'lowercase', height: 22 }}
                  />
                )}
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('birthdate', {
        header: 'Birthdate',
        cell: ({ row }) => <ClientBirthdateCell birthdate={row.original.birthdate} />
      }),
      columnHelper.display({
        id: 'age',
        header: dictionary.form.age,
        cell: ({ row }) => {
          const age = calculateAge(row.original.birthdate)

          return <Typography>{age !== undefined ? age : '-'}</Typography>
        }
      }),
      columnHelper.accessor('gender', {
        header: 'Gender',
        cell: ({ row }) => <Typography>{row.original.gender || '-'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={dictionary.form[row.original.status || 'unknown'] || '-'}
            size='small'
            color={patientStatusObj[String(row.original.status || 'unknown')]}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => setData(data?.filter(patient => patient.id !== row.original.id))}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
            <IconButton>
              <Link href={getLocalizedUrl(`/apps/patient/view/${row.original.id}`, locale as Locale)} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Download',
                  icon: 'tabler-download',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                },
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ]
  }, [data, filteredData, dictionary])

  const table = useReactTable({
    data: filteredData as PatientType[],
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

  const getAvatar = (params: { avatar?: string; fullName?: string }) => {
    const { avatar, fullName } = params
    const safeName = fullName || 'P'

    if (avatar) {
      return <CustomAvatar src={avatar} size={34} />
    } else {
      return <CustomAvatar size={34}>{getInitials(safeName)}</CustomAvatar>
    }
  }

  // Handler to show 'new' label for a short time after patient creation
  const handleAddPatient = (newPatient: PatientType) => {
    setData([newPatient, ...data])
    setNewPatientId(newPatient.id)
    setTimeout(() => setNewPatientId(null), 2000)
  }

  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <PatientTableFilters setData={setFilteredData} tableData={data} />
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={pageSize}
            onChange={e => {
              const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

              params.set('pageSize', e.target.value)
              params.set('page', '1') // reset to first page on pageSize change
              router.push(`${pathname}?${params.toString()}`)
            }}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Patient'
              className='max-sm:is-full'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddPatientOpen(!addPatientOpen)}
              className='max-sm:is-full'
            >
              Add New Patient
            </Button>
          </div>
        </div>
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
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map((row, idx) => {
                    // Highlight the first row if it's a new patient (not present in the rest of the data)
                    const isNewPatient = idx === 0 && data.length > 0 && data[0].id === row.original.id

                    return (
                      <tr
                        key={row.id}
                        className={classnames({
                          selected: row.getIsSelected(),
                          [tableStyles.newPatientRow]: isNewPatient
                        })}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component='div'
          count={total}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={(_, newPage) => {
            const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

            params.set('page', (newPage + 1).toString())
            router.push(`${pathname}?${params.toString()}`)
          }}
          onRowsPerPageChange={e => {
            const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

            params.set('pageSize', e.target.value)
            params.set('page', '1')
            router.push(`${pathname}?${params.toString()}`)
          }}
        />
      </Card>
      <AddPatientDrawer
        open={addPatientOpen}
        handleClose={() => setAddPatientOpen(!addPatientOpen)}
        patientData={data}
        setData={setData}
        onPatientCreated={handleAddPatient}
      />
    </>
  )
}

export default PatientListTable
