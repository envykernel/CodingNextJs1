'use client'

// React Imports
import { useEffect } from 'react'

// Component Imports
import CommercialSection from '@views/front-pages/commercial/CommercialSection'
import FreeTrial from '@views/front-pages/commercial/FreeTrial'
import Plans from '@views/front-pages/commercial/Plans'
import { useSettings } from '@core/hooks/useSettings'

// Type Imports
import type { PricingPlanType } from '@/types/pages/pricingTypes'

const CommercialWrapper = ({ data }: { data: PricingPlanType[] }) => {
  // Hooks
  const { updatePageSettings } = useSettings()

  // For Page specific settings
  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <CommercialSection data={data} />
      <FreeTrial />
      <Plans />
    </>
  )
}

export default CommercialWrapper
