// Component Imports
import CommercialWrapper from '@/views/front-pages/commercial'

// Data Imports
import { getPricingData } from '@/app/server/actions'

const CommercialPage = async () => {
  // Vars
  const data = await getPricingData()

  return <CommercialWrapper data={data} />
}

export default CommercialPage
