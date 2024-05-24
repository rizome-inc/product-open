-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SuperAdmin', 'Admin', 'User');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Deactivated');

-- CreateEnum
CREATE TYPE "ContributorRole" AS ENUM ('Owner', 'Approver', 'Contributor', 'ReadOnly');

-- CreateEnum
CREATE TYPE "TemplateScope" AS ENUM ('System', 'Organization', 'User');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Active', 'Archived');

-- CreateEnum
CREATE TYPE "ProjectApprovalResponse" AS ENUM ('Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AddedAsDiscussionParticipant', 'AddedAsProjectContributor', 'DiscussionCommentMention', 'ProjectReviewRequested');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "roles" "UserRole"[] DEFAULT ARRAY['User']::"UserRole"[],
    "status" "UserStatus" NOT NULL DEFAULT 'Active',
    "organization_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "email_notifications" JSONB,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributors" (
    "id" SERIAL NOT NULL,
    "role" "ContributorRole" NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_templates" (
    "id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "example" TEXT,
    "name" TEXT NOT NULL,
    "scope" "TemplateScope" NOT NULL DEFAULT 'Organization',
    "creator_id" INTEGER,
    "organization_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "project_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "default_project_templates" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "example" TEXT,
    "name" TEXT NOT NULL,
    "scope" "TemplateScope" NOT NULL DEFAULT 'System',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "default_project_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "published_at" TIMESTAMPTZ(3),
    "name" TEXT NOT NULL,
    "business_unit" TEXT,
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "template_id" INTEGER,
    "status" "ProjectStatus" NOT NULL DEFAULT 'Active',
    "creator_id" INTEGER,
    "organization_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_content" (
    "id" SERIAL NOT NULL,
    "work_tracking_url" TEXT,
    "work_tracking_name" TEXT,
    "form_fields" JSONB,
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "project_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_content_file_attachments" (
    "id" SERIAL NOT NULL,
    "mime_type" TEXT,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "thumbnail" JSONB,
    "creator_id" INTEGER NOT NULL,
    "project_content_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "project_content_file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_approvals" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "response" "ProjectApprovalResponse" NOT NULL DEFAULT 'Approved',
    "rejection_reason" TEXT,
    "creator_id" INTEGER NOT NULL,
    "discussion_id" INTEGER,
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "project_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussions" (
    "id" SERIAL NOT NULL,
    "completed_at" TIMESTAMPTZ(3),
    "name" TEXT NOT NULL,
    "topic" TEXT,
    "outcome" TEXT,
    "creator_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_linked_documents" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location_name" TEXT,
    "discussion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discussion_linked_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_comments" (
    "id" SERIAL NOT NULL,
    "content" JSONB NOT NULL,
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "creator_id" INTEGER NOT NULL,
    "discussion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discussion_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_file_attachments" (
    "id" SERIAL NOT NULL,
    "mime_type" TEXT,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "thumbnail" JSONB,
    "creator_id" INTEGER NOT NULL,
    "discussion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discussion_file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_comment_file_attachments" (
    "id" SERIAL NOT NULL,
    "mime_type" TEXT,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "thumbnail" JSONB,
    "creator_id" INTEGER NOT NULL,
    "discussion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discussion_comment_file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "completed_at" TIMESTAMPTZ(3),
    "read_at" TIMESTAMPTZ(3),
    "type" "NotificationType" NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "discussion_id" INTEGER,
    "discussion_comment_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "help" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "reason" TEXT,
    "difficulty" TEXT,
    "preference" TEXT,
    "suggestion" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_participant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_id_organization_id_idx" ON "users"("id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "project_templates_organization_id_idx" ON "project_templates"("organization_id");

-- CreateIndex
CREATE INDEX "project_templates_scope_idx" ON "project_templates"("scope");

-- CreateIndex
CREATE INDEX "projects_organization_id_status_idx" ON "projects"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_content_project_id_key" ON "project_content"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_approvals_discussion_id_key" ON "project_approvals"("discussion_id");

-- CreateIndex
CREATE INDEX "project_approvals_project_id_idx" ON "project_approvals"("project_id");

-- CreateIndex
CREATE INDEX "project_approvals_project_id_is_active_creator_id_idx" ON "project_approvals"("project_id", "is_active", "creator_id");

-- CreateIndex
CREATE INDEX "notifications_id_user_id_completed_at_idx" ON "notifications"("id", "user_id", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "_participant_AB_unique" ON "_participant"("A", "B");

-- CreateIndex
CREATE INDEX "_participant_B_index" ON "_participant"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributors" ADD CONSTRAINT "contributors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributors" ADD CONSTRAINT "contributors_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_templates" ADD CONSTRAINT "project_templates_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_templates" ADD CONSTRAINT "project_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_content" ADD CONSTRAINT "project_content_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_content_file_attachments" ADD CONSTRAINT "project_content_file_attachments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_content_file_attachments" ADD CONSTRAINT "project_content_file_attachments_project_content_id_fkey" FOREIGN KEY ("project_content_id") REFERENCES "project_content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_content_file_attachments" ADD CONSTRAINT "project_content_file_attachments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_approvals" ADD CONSTRAINT "project_approvals_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_approvals" ADD CONSTRAINT "project_approvals_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_approvals" ADD CONSTRAINT "project_approvals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_linked_documents" ADD CONSTRAINT "discussion_linked_documents_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_comments" ADD CONSTRAINT "discussion_comments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_comments" ADD CONSTRAINT "discussion_comments_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_file_attachments" ADD CONSTRAINT "discussion_file_attachments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_file_attachments" ADD CONSTRAINT "discussion_file_attachments_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_comment_file_attachments" ADD CONSTRAINT "discussion_comment_file_attachments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_comment_file_attachments" ADD CONSTRAINT "discussion_comment_file_attachments_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussion_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_discussion_comment_id_fkey" FOREIGN KEY ("discussion_comment_id") REFERENCES "discussion_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participant" ADD CONSTRAINT "_participant_A_fkey" FOREIGN KEY ("A") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participant" ADD CONSTRAINT "_participant_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
