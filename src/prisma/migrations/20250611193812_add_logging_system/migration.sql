-- CreateEnum
CREATE TYPE "LogActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'PRINT', 'EXPORT', 'LOGIN', 'LOGOUT', 'ARCHIVE', 'RESTORE', 'OTHER');

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "userId" INTEGER,
    "actionType" "LogActionType" NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" INTEGER,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_organisationId_idx" ON "Log"("organisationId");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Log_actionType_idx" ON "Log"("actionType");

-- CreateIndex
CREATE INDEX "Log_entityType_idx" ON "Log"("entityType");

-- CreateIndex
CREATE INDEX "Log_entityId_idx" ON "Log"("entityId");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserInternal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
