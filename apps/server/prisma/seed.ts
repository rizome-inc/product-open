import {
  Organization,
  Prisma,
  PrismaClient,
  ProjectTemplate,
  TemplateScope,
  User,
  UserRole,
} from "@prisma/client";
import { DefaultTemplates } from "./defaultProjectTemplates";
import monty from "./montyTemplate.json";
import { createAdminClient } from "../src/lib/supabase";

const prisma = new PrismaClient();

const users: Pick<User, "email" | "firstName" | "lastName" | "roles">[] = [
  {
    email: "duncan@rizo.me",
    firstName: "Duncan",
    lastName: "McIsaac",
    roles: [UserRole.SuperAdmin],
  },
  {
    email: "taylor@rizo.me",
    firstName: "Taylor",
    lastName: "Laubach",
    roles: [UserRole.SuperAdmin],
  },
];

const organization: Pick<Organization, "name"> = {
  name: "Rizome Test",
};

async function main() {
  const supabaseClient = createAdminClient();
  try {
    console.log("Deleting Supabase auth users...");
    const {
      data: { users: sbUsers },
      error,
    } = await supabaseClient.auth.admin.listUsers();
    if (error) {
      throw error;
    }

    for await (const u of sbUsers) {
      await supabaseClient.auth.admin.deleteUser(u.id);
    }
    console.log("Seeding database and Supabase auth...");
    await prisma.$transaction(async (tx) => {
      const defaultTemplatePromises = DefaultTemplates.map(async (template) => {
        const { id, name, description, active, example, content, contentVersion } = template;
        const data = {
          id,
          name,
          description,
          active: active ? true : false,
          example,
          content: content as unknown as Prisma.JsonObject,
          contentVersion,
        };
        return tx.defaultProjectTemplate.upsert({
          where: {
            id: template.id,
          },
          update: data,
          create: data,
        });
      });
      await Promise.all(defaultTemplatePromises);

      const org = await tx.organization.create({
        data: organization,
      });

      const supabaseAuthUsers = await Promise.all(
        users.map(async (u) =>
          supabaseClient.auth.admin.createUser({
            email: u.email,
            email_confirm: true,
          }),
        ),
      );

      const userPromises = users.map((u) => {
        const supabaseId = supabaseAuthUsers.find((au) => au.data.user?.email === u.email)?.data
          .user?.id;
        if (!supabaseId) throw new Error(`Failed to create supabase auth user for ${u.email}`);
        return tx.user.create({
          data: {
            ...u,
            supabaseId,
            organization: {
              connect: {
                id: org.id,
              },
            },
          },
        });
      });
      await Promise.all(userPromises);
      console.log("Users created");

      // Not using a createMany in case we want to change this in the future
      const projectTemplateData = DefaultTemplates.map((t) => {
        const { content, description, example, name } = t;
        return {
          content: content as Prisma.JsonObject,
          description,
          example,
          name,
        }; // as unknown as Pick<ProjectTemplate, "content" | "description" | "example" | "name">;
      });
      await Promise.all(
        projectTemplateData.map((t) => {
          return tx.projectTemplate.create({
            data: {
              ...t,
              creatorId: 1,
              organizationId: org.id,
            },
          });
        }),
      );

      const { content: montyContent, ...restOfMontyContent } = monty;

      await tx.projectTemplate.create({
        data: {
          content: montyContent as Prisma.JsonObject,
          ...restOfMontyContent,
          scope: TemplateScope.Organization,
          organization: {
            connect: {
              id: org.id,
            },
          },
        },
      });
    });

    console.log("default project templates added/updated");
  } catch (error) {
    console.error(error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // todo: add an ignore for this line
    process.exit(1);
  });
