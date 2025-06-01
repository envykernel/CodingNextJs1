'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

import { useTranslation } from '@/contexts/translationContext'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@/configs/i18n'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Components
const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const NotAuthorized = ({
  mode,
  heading,
  message,
  buttonText,
  simple = false
}: {
  mode: SystemMode
  heading?: string
  message?: string
  buttonText?: string
  simple?: boolean
}) => {
  // Vars
  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'

  // Hooks
  const theme = useTheme()
  const params = useParams()
  const locale = params?.lang || 'en'
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const miscBackground = useImageVariant(mode, lightImg, darkImg)
  const t = useTranslation()

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset] mbe-6'>
          {simple ? (
            <>
              <Typography className='font-medium text-8xl' color='text.primary'>
                403
              </Typography>
              <Typography variant='h4'>{heading || t.t('accessDenied.heading') || 'You do not have access'}</Typography>
              <Typography>
                {message || t.t('accessDenied.message') || 'You do not have permission to access this page.'}
              </Typography>
            </>
          ) : (
            <>
              <Typography className='font-medium text-8xl' color='text.primary'>
                401
              </Typography>
              <Typography variant='h4'>{heading || t.t('accessDenied.heading') || 'You do not have access'}</Typography>
              <Typography>
                {message || t.t('accessDenied.message') || 'You do not have permission to access this page.'}
              </Typography>
            </>
          )}
        </div>
        <Button href={getLocalizedUrl('/', locale as Locale)} component={Link} variant='contained'>
          {buttonText || t.t('accessDenied.button') || 'Back to Home'}
        </Button>
        {!simple && (
          <img
            alt='error-401-illustration'
            src='/images/illustrations/characters/3.png'
            className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px] mbs-10 md:mbs-14 lg:mbs-20'
          />
        )}
      </div>
      {!hidden && !simple && (
        <MaskImg
          alt='mask'
          src={miscBackground}
          className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
        />
      )}
    </div>
  )
}

export default NotAuthorized
