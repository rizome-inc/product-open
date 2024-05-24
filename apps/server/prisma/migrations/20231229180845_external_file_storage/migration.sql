/*
  Warnings:

  - You are about to drop the `discussion_comment_file_attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discussion_file_attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_content_file_attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "discussion_comment_file_attachments" DROP CONSTRAINT "discussion_comment_file_attachments_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "discussion_comment_file_attachments" DROP CONSTRAINT "discussion_comment_file_attachments_discussion_id_fkey";

-- DropForeignKey
ALTER TABLE "discussion_file_attachments" DROP CONSTRAINT "discussion_file_attachments_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "discussion_file_attachments" DROP CONSTRAINT "discussion_file_attachments_discussion_id_fkey";

-- DropForeignKey
ALTER TABLE "project_content_file_attachments" DROP CONSTRAINT "project_content_file_attachments_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "project_content_file_attachments" DROP CONSTRAINT "project_content_file_attachments_project_content_id_fkey";

-- DropForeignKey
ALTER TABLE "project_content_file_attachments" DROP CONSTRAINT "project_content_file_attachments_project_id_fkey";

-- DropTable
DROP TABLE "discussion_comment_file_attachments";

-- DropTable
DROP TABLE "discussion_file_attachments";

-- DropTable
DROP TABLE "project_content_file_attachments";

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "organization_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discussion_id" INTEGER,
    "discussion_comment_id" INTEGER,
    "project_id" INTEGER,
    "project_content_id" INTEGER,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_discussion_comment_id_fkey" FOREIGN KEY ("discussion_comment_id") REFERENCES "discussion_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_project_content_id_fkey" FOREIGN KEY ("project_content_id") REFERENCES "project_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;
