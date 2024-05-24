import { Prisma, PrismaClient } from "@prisma/client";
import { base } from "./base";
import { createAdminClient } from "../../src/lib/supabase";
import { v4 as uuidgen } from "uuid";

/**
 * The large code refactor introduces some data model simplifications. This script serves to
 * implement those programmatically and idempotently.
 *
 * 1. Create supabase auth records for each user, and update their users.supabaseId field
 * 2. Copy work tracking data + formFields from project_content and write it the corresponding projects record
 *
 * The form field data in projects, project templates and default project templates does not need to be transformed,
 * since it's all stored with `categories` as the top-level JSON key. Much of the previous app complexity was due
 * to business logic introducing extraneous levels of nesting in memory.
 *
 * dev note: auth creation isn't working locally. we'll see if it works in prod. if not, I'll manually create auth users
 * and update their data.
 * https://www.reddit.com/r/Supabase/comments/13r1scv/error_adding_new_user/
 */

const fn = async () => {
  const db = new PrismaClient();
  const supabaseAdminClient = createAdminClient();
  const usersWithoutSupabaseId = await db.user.findMany({
    select: {
      id: true,
      email: true,
    },
    where: {
      supabaseId: null,
    },
  });
  console.log(`Found ${usersWithoutSupabaseId.length} users without supabaseId set`);
  // Supabase has a minimum password length requirement of 6 characters for email accounts, even though we use OTP
  for await (const user of usersWithoutSupabaseId) {
    const { data, error } = await supabaseAdminClient.auth.admin.createUser({
      email: user.email,
      password: uuidgen(),
    });
    if (error || !data.user) {
      console.error(
        `Encountered an error when creating a Supabase account for ${user.email}`,
        error,
        data,
      );
    } else {
      const supabaseId = data.user.id;
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          supabaseId,
        },
      });
    }
  }
  console.log("\n");
  console.log("Copying project_content data to projects");
  const projectsWithoutData = await db.project.findMany({
    select: {
      id: true,
    },
    where: {
      OR: [
        {
          workTrackingName: null,
        },
        {
          workTrackingUrl: null,
        },
        {
          content: {
            equals: Prisma.AnyNull,
          },
        },
      ],
    },
  });
  console.log(`Found ${projectsWithoutData.length} projects without data set`);
  for await (const project of projectsWithoutData) {
    const projectContent = await db.projectContent.findFirst({
      where: {
        projectId: project.id,
      },
    });
    if (!projectContent) {
      console.error(`No project content found for project ${project.id}`);
    } else {
      await db.project.update({
        where: {
          id: project.id,
        },
        data: {
          workTrackingName: projectContent.workTrackingName,
          workTrackingUrl: projectContent.workTrackingUrl,
          content: projectContent.formFields as Prisma.JsonObject,
        },
      });
    }
  }
  console.log(`\nData migration complete`);
};

base(fn);

export {};
