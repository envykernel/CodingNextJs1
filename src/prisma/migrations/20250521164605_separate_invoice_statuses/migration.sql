/*
  Warnings:

  - You are about to drop the column `status` on the `invoice` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvoicePaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL');

-- CreateEnum
CREATE TYPE "InvoiceRecordStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "status",
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "archived_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "payment_status" "InvoicePaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "record_status" "InvoiceRecordStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "InvoiceStatus";

-- CreateIndex
CREATE INDEX "invoice_archived_by_idx" ON "invoice"("archived_by");

-- CreateIndex
CREATE INDEX "invoice_deleted_by_idx" ON "invoice"("deleted_by");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
