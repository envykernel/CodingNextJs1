-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('GENERAL', 'TECHNICAL', 'BILLING', 'FEEDBACK', 'OTHER');

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "category" "ContactCategory" NOT NULL DEFAULT 'GENERAL',
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "organisation_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_contact_organisation_id" ON "Contact"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_contact_status" ON "Contact"("status");

-- CreateIndex
CREATE INDEX "idx_contact_created_at" ON "Contact"("created_at");

-- CreateIndex
CREATE INDEX "idx_contact_user_id" ON "Contact"("user_id");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserInternal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
