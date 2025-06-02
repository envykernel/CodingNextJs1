// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Component Imports
import { useTranslation } from '@/contexts/translationContext'
import ContactForm from './ContactForm'

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
        <Grid size={{ xs: 12 }}>
          <ContactForm />
        </Grid>
      </Grid>
    </>
  )
}

export default FaqFooter
