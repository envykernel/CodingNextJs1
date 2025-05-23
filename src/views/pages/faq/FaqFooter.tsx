// MUI Imports
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useTranslation } from '@/contexts/translationContext'

const FaqFooter = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className='flex justify-center items-center flex-col text-center gap-2 plb-6'>
        <Chip label={t('faq.title')} color='primary' variant='tonal' size='small' />
        <Typography variant='h4'>{t('faq.contact.title')}</Typography>
        <Typography>{t('faq.contact.message')}</Typography>
      </div>
      <Grid container spacing={6} className='mbs-6'>
        <Grid size={{ xs: 12, md: 6 }}>
          <div className='flex justify-center items-center flex-col gap-4 p-6 rounded bg-actionHover'>
            <CustomAvatar variant='rounded' color='primary' skin='light' size={46}>
              <i className='tabler-phone text-[26px]' />
            </CustomAvatar>

            <div className='flex items-center flex-col gap-1'>
              <Typography variant='h5'>+ (810) 2548 2568</Typography>
              <Typography>{t('faq.contact.phoneMessage')}</Typography>
            </div>
          </div>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <div className='flex justify-center items-center flex-col gap-4 p-6 rounded bg-actionHover'>
            <CustomAvatar variant='rounded' color='primary' skin='light' size={46}>
              <i className='tabler-mail text-[26px]' />
            </CustomAvatar>
            <div className='flex items-center flex-col gap-1'>
              <Typography variant='h5'>hello@help.com</Typography>
              <Typography>{t('faq.contact.emailMessage')}</Typography>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default FaqFooter
