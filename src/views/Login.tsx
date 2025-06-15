'use client'

// MUI Imports
import { useSearchParams, useRouter } from 'next/navigation'

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
  flexDirection: 'column',
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
  background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
  color: '#FFFFFF',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/images/medical-pattern.png")',
    opacity: 0.05,
    zIndex: 0,
    animation: 'patternFloat 20s linear infinite'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 70%)',
    zIndex: 0
  },
  '@keyframes patternFloat': {
    '0%': {
      backgroundPosition: '0 0'
    },
    '100%': {
      backgroundPosition: '100px 100px'
    }
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

const Footer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  fontSize: '0.875rem',
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  marginTop: 'auto'
}))

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  maxWidth: 540,
  margin: '0 auto',
  padding: theme.spacing(6),
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: 4,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(96, 165, 250, 0.15)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(96, 165, 250, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 4,
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent)',
    opacity: 0.5,
    transition: 'opacity 0.3s ease'
  }
}))

const TitleWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -theme.spacing(2),
    left: 0,
    width: 80,
    height: 4,
    background: 'linear-gradient(90deg, #60A5FA, transparent)',
    borderRadius: 2,
    animation: 'underlineWidth 2s ease-in-out infinite alternate'
  },
  '@keyframes underlineWidth': {
    '0%': {
      width: '60px'
    },
    '100%': {
      width: '100px'
    }
  }
}))

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(3),
  marginTop: theme.spacing(6),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '1px',
    height: '80%',
    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)',
    zIndex: 0
  }
}))

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: 4,
  transition: 'all 0.3s ease',
  position: 'relative',
  border: '1px solid rgba(96, 165, 250, 0.1)',
  boxShadow: 'inset 0 0 0 1px rgba(96, 165, 250, 0.05)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 4,
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(96, 165, 250, 0.2)',
    boxShadow: 'inset 0 0 0 1px rgba(96, 165, 250, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)',
    '&::before': {
      opacity: 1
    }
  }
}))

const IconWrapper = styled(Box)(() => ({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& i': {
    fontSize: '1.25rem',
    color: '#FFFFFF',
    opacity: 1,
    position: 'relative',
    zIndex: 3
  }
}))

const CommercialButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2.5, 4),
  fontSize: '1.1rem',
  fontWeight: 500,
  borderRadius: '8px',
  textTransform: 'none',
  background: 'rgba(96, 165, 250, 0.1)',
  color: '#FFFFFF',
  border: '1px solid rgba(96, 165, 250, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.2), transparent)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease'
  },
  '&:hover': {
    background: 'rgba(96, 165, 250, 0.15)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(96, 165, 250, 0.15)',
    '&::before': {
      transform: 'translateX(100%)'
    },
    '& .button-icon': {
      transform: 'translateX(4px) rotate(-45deg)'
    }
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 4px 8px rgba(96, 165, 250, 0.1)'
  }
}))

const Login = () => {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')
  const router = useRouter()

  const getErrorMessage = (errorCode: string | null) => {
    if (errorCode === 'AccessDenied') {
      return 'Accès refusé. Veuillez contacter votre administrateur pour obtenir les autorisations nécessaires.'
    }

    return 'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
  }

  const handleCommercialClick = () => {
    router.push('/front-pages/commercial')
  }

  return (
    <LoginContainer>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <LeftSection>
          <ContentWrapper>
            <TitleWrapper>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                  letterSpacing: '-0.5px',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2
                }}
              >
                Plateforme de Gestion Médicale
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  opacity: 0.9,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  maxWidth: '90%'
                }}
              >
                Une solution simple et efficace pour gérer votre cabinet médical
              </Typography>
            </TitleWrapper>

            <FeatureGrid>
              <FeatureItem>
                <IconWrapper>
                  <i className='tabler-users' />
                </IconWrapper>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Gestion des Patients
                </Typography>
              </FeatureItem>
              <FeatureItem>
                <IconWrapper>
                  <i className='tabler-calendar-check' />
                </IconWrapper>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Rendez-vous
                </Typography>
              </FeatureItem>
              <FeatureItem>
                <IconWrapper>
                  <i className='tabler-file-invoice' />
                </IconWrapper>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Factures
                </Typography>
              </FeatureItem>
              <FeatureItem>
                <IconWrapper>
                  <i className='tabler-credit-card' />
                </IconWrapper>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Paiements
                </Typography>
              </FeatureItem>
              <FeatureItem>
                <IconWrapper>
                  <i className='tabler-dashboard' />
                </IconWrapper>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Tableau de Bord
                </Typography>
              </FeatureItem>
              <FeatureItem>
                <IconWrapper>
                  <i className='tabler-chart-bar' />
                </IconWrapper>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  Rapports
                </Typography>
              </FeatureItem>
            </FeatureGrid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CommercialButton
                onClick={handleCommercialClick}
                sx={{
                  mt: 4,
                  width: '100%',
                  maxWidth: 400,
                  mx: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}
              >
                Découvrir nos formules tarifaires
                <i
                  className='tabler-arrow-right button-icon'
                  style={{
                    fontSize: '1.25rem',
                    transition: 'transform 0.3s ease',
                    transform: 'rotate(-45deg)'
                  }}
                />
              </CommercialButton>
            </Box>
          </ContentWrapper>
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
      </Box>
      <Footer>
        <Typography variant='body2'>
          © {new Date().getFullYear()} Application de Gestion de Cabinet Médical - Tous droits réservés
        </Typography>
      </Footer>
    </LoginContainer>
  )
}

export default Login
