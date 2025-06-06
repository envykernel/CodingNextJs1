// Type Imports
import type { Data } from '@/types/pages/profileTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Data Imports
import { getCurrentUserProfile } from '@/app/server/actions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'

const ProfilePage = async ({ params }: { params: { lang: Locale } }) => {
  // Get user profile data and dictionary
  const [{ profileHeader }, dictionary] = await Promise.all([getCurrentUserProfile(), getDictionary(params.lang)])

  // Create data object with profile header and empty arrays for tabs
  const data: Data = {
    profileHeader,
    users: {
      profile: {
        teams: [],
        about: [],
        contacts: [],
        overview: [],
        teamsTech: [],
        connections: [],
        projectTable: []
      },
      projects: [],
      connections: []
    }
  }

  return (
    <TranslationProvider dictionary={dictionary}>
      <UserProfile data={data} />
    </TranslationProvider>
  )
}

export default ProfilePage
