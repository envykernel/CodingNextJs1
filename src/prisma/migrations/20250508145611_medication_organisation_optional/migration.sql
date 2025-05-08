-- CreateTable
CREATE TABLE "medication" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "organisation_id" INTEGER,

    CONSTRAINT "medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medication_name_key" ON "medication"("name");

-- CreateIndex
CREATE INDEX "medication_organisation_id_idx" ON "medication"("organisation_id");

-- AddForeignKey
ALTER TABLE "medication" ADD CONSTRAINT "medication_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
