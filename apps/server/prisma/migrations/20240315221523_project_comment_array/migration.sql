/*
  Warnings:

  - The `liveblocks_comments` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "liveblocks_comments",
ADD COLUMN     "liveblocks_comments" JSONB[];
