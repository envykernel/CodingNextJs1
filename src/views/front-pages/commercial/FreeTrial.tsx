// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

// Third-party Imports
import classnames from 'classnames'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

const FreeTrial = () => {
  return (
    <section className='bg-[var(--mui-palette-primary-lightOpacity)]'>
      <div className={classnames('flex justify-between flex-wrap md:relative', frontCommonStyles.layoutSpacing)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <div className='flex flex-col gap-11 items-center md:items-start justify-center plb-12'>
              <div className='flex flex-col gap-2 max-md:text-center'>
                <Typography variant='h4' color='primary.main' className='font-medium'>
                  Besoin d&apos;informations supplémentaires ?
                </Typography>
                <Typography>
                  Contactez-nous par email à{' '}
                  <Link href='mailto:contact@oryxus.net' className='text-primary hover:underline'>
                    contact@oryxus.net
                  </Link>{' '}
                  pour toute question sur nos solutions.
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <div className='md:absolute md:inline-end-[90px] xl:inline-end-[2%] flex justify-center block-end-0'>
              <img src='/images/illustrations/characters/4.png' alt='contact support' className='bs-[270px]' />
            </div>
          </Grid>
        </Grid>
      </div>
    </section>
  )
}

export default FreeTrial
