// Component Imports
import { Grid, Card, Box, Typography } from '@mui/material'

import UsersManagement from '@views/pages/users-management'

// Data Imports
import { getUsersList } from '@/app/server/userActions'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'
import { getUserOrganisation } from '@/utils/getUserOrganisation'

// MUI Imports

interface SearchParams {
  page?: string | string[]
  pageSize?: string | string[]
  name?: string | string[]
}

type CommonTranslations = {
  tryAgainLater: string

  // Add other common translations as needed
}

type DictionaryWithCommon = {
  common: CommonTranslations
  [key: string]: any
}

const UsersManagementPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ lang: Locale }>
  searchParams: Promise<SearchParams>
}) => {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const dictionary = (await getDictionary(lang)) as DictionaryWithCommon

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

  try {
    // Get the logged-in user's organisationId
    const { organisationId } = await getUserOrganisation()
    const usersData = await getUsersList({ page, pageSize, name, organisationId: organisationId.toString() })

    // Transform the users data to convert createdAt from string to Date
    const transformedUsers = usersData.users.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt)
    }))

    return (
      <TranslationProvider dictionary={dictionary}>
        <UsersManagement
          usersData={transformedUsers}
          page={usersData.page}
          pageSize={usersData.pageSize}
          total={usersData.total}
        />
      </TranslationProvider>
    )
  } catch (error) {
    return (
      <TranslationProvider dictionary={dictionary}>
        <Grid container justifyContent='center' alignItems='center' sx={{ minHeight: '60vh' }}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant='h5' color='error'>
                {dictionary.common.tryAgainLater}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </TranslationProvider>
    )
  }
}

export default UsersManagementPage
