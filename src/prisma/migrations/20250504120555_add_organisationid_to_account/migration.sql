-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "organisationId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organisationId" INTEGER;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_appointment" ADD CONSTRAINT "patient_appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
