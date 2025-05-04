-- AlterTable
ALTER TABLE "organisation" ADD COLUMN     "break_end_time" VARCHAR(5),
ADD COLUMN     "break_start_time" VARCHAR(5),
ADD COLUMN     "work_end_time" VARCHAR(5),
ADD COLUMN     "work_start_time" VARCHAR(5),
ADD COLUMN     "working_days" VARCHAR(20)[];
