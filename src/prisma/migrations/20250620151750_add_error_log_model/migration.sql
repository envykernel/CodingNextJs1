/*
  Warnings:

  - The `history_type` column on the `patient_medical_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('ALLERGY', 'CHRONIC_DISEASE', 'SURGERY', 'HOSPITALIZATION', 'FAMILY_HISTORY', 'VACCINATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ErrorSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "patient_medical_history" DROP COLUMN "history_type",
ADD COLUMN     "history_type" "HistoryType";

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER,
    "userId" INTEGER,
    "errorName" VARCHAR(255) NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "stackTrace" TEXT,
    "errorCode" VARCHAR(50),
    "url" VARCHAR(500),
    "component" VARCHAR(255),
    "page" VARCHAR(255),
    "method" VARCHAR(50),
    "apiEndpoint" VARCHAR(500),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "sessionId" VARCHAR(255),
    "requestBody" JSONB,
    "requestHeaders" JSONB,
    "queryParams" JSONB,
    "formData" JSONB,
    "severity" "ErrorSeverity" NOT NULL DEFAULT 'MEDIUM',
    "category" VARCHAR(100),
    "tags" VARCHAR(50)[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorLog_organisationId_idx" ON "ErrorLog"("organisationId");

-- CreateIndex
CREATE INDEX "ErrorLog_userId_idx" ON "ErrorLog"("userId");

-- CreateIndex
CREATE INDEX "ErrorLog_severity_idx" ON "ErrorLog"("severity");

-- CreateIndex
CREATE INDEX "ErrorLog_category_idx" ON "ErrorLog"("category");

-- CreateIndex
CREATE INDEX "ErrorLog_errorName_idx" ON "ErrorLog"("errorName");

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- CreateIndex
CREATE INDEX "ErrorLog_url_idx" ON "ErrorLog"("url");

-- CreateIndex
CREATE INDEX "ErrorLog_component_idx" ON "ErrorLog"("component");

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserInternal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
