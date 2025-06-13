'use client'

import React from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useTranslation } from '@/contexts/translationContext'
import { formatRadiologyDate } from '@/utils/date'

interface RadiologyBlockProps {
  radiologyOrders: any[]
}

const RadiologyBlock = ({ radiologyOrders }: RadiologyBlockProps) => {
  const { t } = useTranslation()

  if (!radiologyOrders || radiologyOrders.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color='text.secondary'>{t('radiology.noOrders') || 'No radiology orders recorded'}</Typography>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex items-center gap-3'>
          <i className='tabler-scan text-xl text-primary' />
          <Typography variant='h6'>{t('radiology.title') || 'Radiology Orders'}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          {radiologyOrders.map(order => (
            <Grid item xs={12} key={order.id}>
              <Card variant='outlined'>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                          {order.exam_type?.name}
                        </Typography>
                        <Chip
                          label={t(`radiology.status.${order.status}`) || order.status}
                          color={getStatusColor(order.status)}
                          size='small'
                        />
                      </Box>
                    </Grid>

                    {order.notes && (
                      <Grid item xs={12}>
                        <Typography variant='body2' color='text.secondary'>
                          {t('radiology.notes') || 'Notes'}: {order.notes}
                        </Typography>
                      </Grid>
                    )}

                    {order.result && (
                      <Grid item xs={12}>
                        <Typography variant='body2' color='text.secondary'>
                          {t('radiology.result') || 'Result'}: {order.result}
                        </Typography>
                      </Grid>
                    )}

                    {order.result_date && (
                      <Grid item xs={12}>
                        <Typography variant='body2' color='text.secondary'>
                          {t('radiology.resultDate') || 'Result Date'}: {formatRadiologyDate(order.result_date)}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Typography variant='caption' color='text.secondary'>
                        {t('radiology.orderedAt') || 'Ordered at'}: {formatRadiologyDate(order.ordered_at)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export default RadiologyBlock
