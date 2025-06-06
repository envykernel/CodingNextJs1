// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Type Imports
import type { ProfileHeaderType } from '@/types/pages/profileTypes'

// Hook Imports
import { useTranslation } from '@/contexts/translationContext'

const UserProfileHeader = ({ data }: { data?: ProfileHeaderType }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardMedia
        sx={{
          background: data?.coverImg?.startsWith('linear-gradient') ? data.coverImg : undefined,
          backgroundImage: data?.coverImg?.startsWith('linear-gradient') ? undefined : `url(${data?.coverImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        className='bs-[250px]'
      />
      <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0 border-backgroundPaper bg-backgroundPaper'>
          <div className='flex items-center justify-center bs-[120px] is-[120px] bg-primary bg-opacity-10 rounded'>
            <i className={`${data?.profileImg} text-[64px]`} />
          </div>
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{data?.fullName}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                {data?.designationIcon && <i className={data?.designationIcon} />}
                <Typography className='font-medium'>{t(`usersManagement.roles.${data?.designation}`)}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className={data?.locationIcon || 'tabler-building'} />
                <Typography className='font-medium'>{data?.location}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar' />
                <Typography className='font-medium'>
                  {t('userProfile.joinedOn')} {data?.joiningDate}
                </Typography>
              </div>
            </div>
          </div>
          <Button variant='contained' className='flex gap-2'>
            <i className='tabler-user-check !text-base'></i>
            <span>{t('userProfile.connected')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
