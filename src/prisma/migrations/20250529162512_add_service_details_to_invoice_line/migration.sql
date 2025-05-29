/*
  Warnings:

  - Added the required column `service_code` to the `invoice_line` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_name` to the `invoice_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice_line" ADD COLUMN     "service_code" VARCHAR(20) NOT NULL,
ADD COLUMN     "service_description" TEXT,
ADD COLUMN     "service_name" VARCHAR(100) NOT NULL;
