import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateDoctors() {
  try {
    // First verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: 1 }
    })

    if (!doctor) {
      throw new Error(
        'Doctor with ID 1 does not exist. Please ensure a doctor with ID 1 exists before running this script.'
      )
    }

    // Update all patients
    const result = await prisma.$executeRaw`
      UPDATE patient 
      SET doctor = ${doctor.name}
      WHERE doctor IS NOT NULL
    `

    console.log(`Updated ${result} patients to have doctor = '${doctor.name}'`)
  } catch (error) {
    console.error('Error updating doctors:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateDoctors()
