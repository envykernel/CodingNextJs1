// Type Imports
import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Data Imports
import { getCurrentUserProfile } from '@/app/server/actions'

const ProfilePage = async () => {
  // Get user profile data
  const { profileHeader } = await getCurrentUserProfile()

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

  return <UserProfile data={data} />
}

export default ProfilePage
