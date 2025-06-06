'use client'

// MUI Imports
import { useSearchParams } from 'next/navigation'

import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { signIn } from 'next-auth/react'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Styled Custom Components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  background: theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
  position: 'relative',
  overflow: 'hidden'
}))

const LeftSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(8),
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)'
      : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
  color: '#FFFFFF',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/images/medical-pattern.png")',
    opacity: 0.1,
    zIndex: 0
  }
}))

const RightSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  background: theme.palette.mode === 'dark' ? '#111827' : '#F8FAFC',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background:
      theme.palette.mode === 'dark'
        ? 'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)'
        : 'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
    pointerEvents: 'none'
  }
}))

const LoginCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 420,
  padding: theme.spacing(7),
  borderRadius: 20,
  background: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #2563EB, #1D4ED8)',
    opacity: 0.8
  }
}))

const GoogleButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.75),
  borderRadius: 12,
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1F2937',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'}`,
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F9FAFB',
    transform: 'translateY(-1px)',
    boxShadow:
      theme.palette.mode === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  }
}))

const AzureADButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.75),
  borderRadius: 12,
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1F2937',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'}`,
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  marginTop: theme.spacing(2),
  '&:hover': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F9FAFB',
    transform: 'translateY(-1px)',
    boxShadow:
      theme.palette.mode === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  }
}))

const LogoWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  display: 'flex',
  justifyContent: 'center',
  '& img': {
    height: 48,
    filter: theme.palette.mode === 'dark' ? 'brightness(0.9)' : 'none'
  }
}))

const ServiceList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(6),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
    borderRadius: '2px'
  }
}))

const ServiceItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 0, 2, 4),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -5,
    top: '50%',
    width: '12px',
    height: '12px',
    background: '#FFFFFF',
    borderRadius: '50%',
    transform: 'translateY(-50%)',
    opacity: 0.5,
    transition: 'all 0.3s ease'
  },
  '&:hover::before': {
    opacity: 1,
    transform: 'translateY(-50%) scale(1.2)'
  },
  '& i': {
    fontSize: '1.25rem',
    color: '#FFFFFF',
    opacity: 0.9,
    marginRight: theme.spacing(3),
    width: '24px',
    textAlign: 'center'
  }
}))

const ServiceLabel = styled(Typography)(() => ({
  fontWeight: 500,
  fontSize: '1.1rem',
  opacity: 0.9,
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 1
  }
}))

const Login = () => {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    if (errorCode === 'AccessDenied') {
      return 'Accès refusé. Veuillez contacter votre administrateur pour obtenir les autorisations nécessaires.'
    }

    return 'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
  }

  return (
    <LoginContainer>
      <LeftSection>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              mb: 3,
              color: '#FFFFFF',
              fontSize: { xs: '2rem', md: '2.5rem' },
              letterSpacing: '-0.5px'
            }}
          >
            Plateforme de Gestion Médicale
          </Typography>

          <Typography
            variant='body1'
            sx={{
              opacity: 0.9,
              maxWidth: '600px',
              lineHeight: 1.6,
              mb: 1,
              fontSize: '1.1rem',
              whiteSpace: 'nowrap'
            }}
          >
            Une solution simple et efficace pour gérer votre cabinet médical
          </Typography>

          <ServiceList>
            <ServiceItem>
              <i className='tabler-users' />
              <ServiceLabel>Gestion des Patients</ServiceLabel>
            </ServiceItem>
            <ServiceItem>
              <i className='tabler-calendar-check' />
              <ServiceLabel>Rendez-vous</ServiceLabel>
            </ServiceItem>
            <ServiceItem>
              <i className='tabler-file-invoice' />
              <ServiceLabel>Factures</ServiceLabel>
            </ServiceItem>
            <ServiceItem>
              <i className='tabler-credit-card' />
              <ServiceLabel>Paiements</ServiceLabel>
            </ServiceItem>
            <ServiceItem>
              <i className='tabler-dashboard' />
              <ServiceLabel>Tableau de Bord Analytique</ServiceLabel>
            </ServiceItem>
          </ServiceList>
        </Box>
      </LeftSection>
      <RightSection>
        <LoginCard>
          <LogoWrapper>
            <Logo />
          </LogoWrapper>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                mb: 1.5,
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.5px'
              }}
            >
              Bienvenue
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                mb: 5,
                fontSize: '1.1rem'
              }}
            >
              Accédez à votre tableau de bord médical en toute sécurité
            </Typography>
            <GoogleButton
              fullWidth
              startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
              onClick={() => signIn('google')}
            >
              Se connecter avec Google
            </GoogleButton>
            <AzureADButton
              fullWidth
              startIcon={
                <img
                  src='/images/logos/microsoft.svg'
                  alt='Microsoft'
                  width={22}
                  height={22}
                  style={{
                    filter: 'brightness(0.9)',
                    objectFit: 'contain'
                  }}
                />
              }
              onClick={() => signIn('azure-ad')}
            >
              Se connecter avec Microsoft
            </AzureADButton>
            {error && (
              <Alert
                severity='error'
                sx={{
                  mt: 3,
                  '& .MuiAlert-message': {
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    width: '100%'
                  },
                  '& .MuiAlert-icon': {
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                {getErrorMessage(error)}
              </Alert>
            )}
            <Box
              sx={{
                mt: 4,
                pt: 4,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <i className='tabler-shield-check text-primary' style={{ fontSize: '1.25rem' }} />
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <span>Ne partagez jamais vos identifiants</span>
              </Typography>
            </Box>
          </Box>
        </LoginCard>
      </RightSection>
    </LoginContainer>
  )
}

export default Login
