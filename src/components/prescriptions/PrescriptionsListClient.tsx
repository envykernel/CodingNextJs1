'use client'

import { useState } from 'react'

import { useParams } from 'next/navigation'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from '@mui/material'

// Mock data for prescriptions
const mockPrescriptions = [
  {
    id: 1,
    patientName: 'John Doe',
    date: '2024-03-20',
    status: 'Active',
    doctor: 'Dr. Smith'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    date: '2024-03-19',
    status: 'Completed',
    doctor: 'Dr. Johnson'
  }
]

export default function PrescriptionsListClient({ dictionary }: { dictionary: any }) {
  const [prescriptions] = useState(mockPrescriptions)
  const params = useParams() as { lang: string }
  const { lang: locale } = params

  return (
    <Card>
      <CardHeader
        title={dictionary?.navigation?.prescriptions}
        action={
          <Link href={`/${locale}/apps/prescriptions/create`} passHref>
            <Button variant='contained' color='primary'>
              {dictionary?.navigation?.createPrescription}
            </Button>
          </Link>
        }
      />
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{dictionary?.navigation?.patientName}</TableCell>
                <TableCell>{dictionary?.navigation?.date}</TableCell>
                <TableCell>{dictionary?.navigation?.status}</TableCell>
                <TableCell>{dictionary?.navigation?.doctor}</TableCell>
                <TableCell>{dictionary?.navigation?.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map(prescription => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.id}</TableCell>
                  <TableCell>{prescription.patientName}</TableCell>
                  <TableCell>{prescription.date}</TableCell>
                  <TableCell>{prescription.status}</TableCell>
                  <TableCell>{prescription.doctor}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Link href={`/${locale}/apps/prescriptions/${prescription.id}`} passHref>
                        <Button variant='outlined' size='small'>
                          {dictionary?.navigation?.view}
                        </Button>
                      </Link>
                      <Link href={`/${locale}/apps/prescriptions/${prescription.id}/edit`} passHref>
                        <Button variant='outlined' size='small' color='primary'>
                          {dictionary?.navigation?.edit}
                        </Button>
                      </Link>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
