import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultTemplates } from "./defaultProjectTemplates";

const prisma = new PrismaClient();

async function main() {
  try {
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
