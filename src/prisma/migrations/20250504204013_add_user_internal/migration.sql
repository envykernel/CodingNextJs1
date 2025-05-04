-- CreateTable
CREATE TABLE "UserInternal" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "organisationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInternal_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInternal_email_key" ON "UserInternal"("email");

-- AddForeignKey
ALTER TABLE "UserInternal" ADD CONSTRAINT "UserInternal_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
