/*
  Warnings:

  - The primary key for the `file_attachments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `file_attachments` table. All the data in the column will be lost.
  - You are about to drop the column `project_content_id` on the `file_attachments` table. All the data in the column will be lost.
  - Added the required column `name` to the `file_attachments` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `file_attachments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "file_attachments" DROP CONSTRAINT "file_attachments_project_content_id_fkey";

-- DropForeignKey
ALTER TABLE "project_content" DROP CONSTRAINT "project_content_project_id_fkey";

-- AlterTable
ALTER TABLE "file_attachments" DROP CONSTRAINT "file_attachments_pkey",
DROP COLUMN "id",
DROP COLUMN "project_content_id",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "uuid" TEXT NOT NULL,
ADD CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "content" JSONB,
ADD COLUMN     "work_tracking_name" TEXT,
ADD COLUMN     "work_tracking_url" TEXT;
