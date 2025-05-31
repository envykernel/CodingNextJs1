// Component Imports
import UsersManagement from '@views/pages/users-management'

// Data Imports
import { getUsersList } from '@/app/server/userActions'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'
import { getUserOrganisation } from '@/utils/getUserOrganisation'

const UsersManagementPage = async ({
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

  const name = resolvedSearchParams?.name
    ? Array.isArray(resolvedSearchParams.name)
      ? resolvedSearchParams.name[0]
      : resolvedSearchParams.name
    : undefined

  // Get the logged-in user's organisationId
  const { organisationId } = await getUserOrganisation()
  const usersData = await getUsersList({ page, pageSize, name, organisationId: organisationId.toString() })

  const dictionary = await getDictionary(lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <UsersManagement
        usersData={usersData.users}
        page={usersData.page}
        pageSize={usersData.pageSize}
        total={usersData.total}
      />
    </TranslationProvider>
  )
}

export default UsersManagementPage
