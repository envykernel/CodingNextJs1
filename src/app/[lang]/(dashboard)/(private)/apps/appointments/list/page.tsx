// Component Imports
import AppointmentsList from '../components/AppointmentsList'
import { getAppointments } from '@/app/server/appointmentsActions'
import { getVisitsByAppointmentIds } from '@/app/server/visitActions'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'

const AppointmentsListApp = async ({
  params,
  searchParams
}: {
  params: Promise<{ lang: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const { lang } = await params
  const resolvedSearchParams = await searchParams

  // Parse pagination params
  const page = resolvedSearchParams?.page
    ? Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page)
    : 1

  const pageSize = resolvedSearchParams?.pageSize
    ? Number(
        Array.isArray(resolvedSearchParams.pageSize) ? resolvedSearchParams.pageSize[0] : resolvedSearchParams.pageSize
      )
    : 10

  const filter = resolvedSearchParams?.filter
    ? Array.isArray(resolvedSearchParams.filter)
      ? resolvedSearchParams.filter[0]
      : resolvedSearchParams.filter
    : undefined

  const status = resolvedSearchParams?.status
    ? Array.isArray(resolvedSearchParams.status)
      ? resolvedSearchParams.status[0]
      : resolvedSearchParams.status
    : undefined

  const type = resolvedSearchParams?.type
    ? Array.isArray(resolvedSearchParams.type)
      ? resolvedSearchParams.type[0]
      : resolvedSearchParams.type
    : undefined

  const startDate = resolvedSearchParams?.startDate
    ? Array.isArray(resolvedSearchParams.startDate)
      ? resolvedSearchParams.startDate[0]
      : resolvedSearchParams.startDate
    : undefined

  const endDate = resolvedSearchParams?.endDate
    ? Array.isArray(resolvedSearchParams.endDate)
      ? resolvedSearchParams.endDate[0]
      : resolvedSearchParams.endDate
    : undefined

  const appointmentData = await getAppointments({
    page,
    pageSize,
    filter,
    status,
    type,
    startDate,
    endDate
  })

  const dictionary = await getDictionary(lang)
  const appointmentIds = appointmentData.appointments.map((a: any) => a.id)
  const visitsByAppointmentId = await getVisitsByAppointmentIds(appointmentIds)

  return (
    <TranslationProvider dictionary={dictionary}>
      <AppointmentsList
        appointmentData={appointmentData.appointments}
        page={appointmentData.page}
        pageSize={appointmentData.pageSize}
        total={appointmentData.total}
        dictionary={dictionary}
        visitsByAppointmentId={visitsByAppointmentId}
      />
    </TranslationProvider>
  )
}

export default AppointmentsListApp
