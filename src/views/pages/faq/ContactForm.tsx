'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import type { ChangeEvent, FormEvent } from 'react'

import { Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, Box, MenuItem } from '@mui/material'

// Hook Imports
import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'

// Type Imports

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  category: 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'FEEDBACK' | 'OTHER'
}

const initialFormData: FormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
  category: 'GENERAL'
}

const ContactForm = () => {
  const { t } = useTranslation()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Update form data when session is available
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Check if user is authenticated and has an organisation ID
    if (status === 'authenticated' && !session?.user?.organisationId) {
      setError(t('faq.contact.form.errorNoOrganisation'))
      setLoading(false)

      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details?.[0]?.message || t('faq.contact.form.error'))
      }

      setSuccess(true)
      setFormData(initialFormData)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('faq.contact.form.error'))
    } finally {
      setLoading(false)
    }
  }

  // Show a message if user is not authenticated
  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardContent>
          <Alert severity='info' className='mb-4'>
            {t('faq.contact.form.loginRequired')}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Typography variant='h5' className='text-center mbs-4'>
            {t('faq.contact.form.title')}
          </Typography>

          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity='success' onClose={() => setSuccess(false)}>
              {t('faq.contact.form.success')}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('faq.contact.form.name')}
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading || !!session?.user}
          />

          <TextField
            fullWidth
            label={t('faq.contact.form.email')}
            name='email'
            type='email'
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading || !!session?.user}
          />

          <TextField
            fullWidth
            select
            label={t('faq.contact.form.category')}
            name='category'
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <MenuItem value='GENERAL'>{t('faq.contact.form.categories.general')}</MenuItem>
            <MenuItem value='TECHNICAL'>{t('faq.contact.form.categories.technical')}</MenuItem>
            <MenuItem value='BILLING'>{t('faq.contact.form.categories.billing')}</MenuItem>
            <MenuItem value='FEEDBACK'>{t('faq.contact.form.categories.feedback')}</MenuItem>
            <MenuItem value='OTHER'>{t('faq.contact.form.categories.other')}</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label={t('faq.contact.form.subject')}
            name='subject'
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label={t('faq.contact.form.message')}
            name='message'
            value={formData.message}
            onChange={handleChange}
            required
            disabled={loading}
            multiline
            rows={4}
            helperText={t('faq.contact.form.messageHelper')}
            error={formData.message.length > 0 && formData.message.length < 10}
          />

          <Box className='flex justify-center'>
            <Button
              type='submit'
              variant='contained'
              disabled={loading || !session?.user?.organisationId}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? t('faq.contact.form.sending') : t('faq.contact.form.send')}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default ContactForm
