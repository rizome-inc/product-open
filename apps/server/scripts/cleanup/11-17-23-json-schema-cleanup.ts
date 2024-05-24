import { base } from "./base";
import { Prisma, PrismaClient } from "@prisma/client";

/**
 * ENG-52: Review template schema definition and remove what we don’t want
 * https://www.notion.so/Review-template-schema-definition-and-remove-what-we-don-t-want-c39c5f5413704fa6b2c5b8d8b3da31ed?pvs=4
 *
 * Scope: need to rename field type and subtype in default_project_templates, project_templates and project_content
 *
 * This may also involve manual changes to remove any instances of `int`, `user` or `tag` fields
 *
 * Guarantees
 * - Idempotency: once the fields are modified, searching for them again shouldn't yield any results
 */

const renameTypesAndSubtypes = (content: Prisma.JsonValue): Prisma.JsonValue => {
  const contentString = JSON.stringify(content, null, 2)
    .replaceAll(`"type": "daterange"`, `"type": "date-range"`)
    .replaceAll(`"type": "multiselect"`, `"type": "multi-select"`)
    .replaceAll(`"type": "string"`, `"type": "short-text"`)
    .replaceAll(`"subtype": "string"`, `"type": "short-text"`)
    .replaceAll(`"type": "decisionLogic"`, `"type": "decision-logic"`);

  return JSON.parse(contentString);
};

const fn = async () => {
  const db = new PrismaClient();
  // default project templates
  const defaultTemplates = await db.defaultProjectTemplate.findMany({
    select: {
      id: true,
      content: true,
    },
  });
  await Promise.all(
    defaultTemplates.map((t) =>
      db.defaultProjectTemplate.update({
        where: {
          id: t.id,
        },
        data: {
          content: renameTypesAndSubtypes(t.content),
        },
      }),
    ),
  );
  console.log(`Checked and updated ${defaultTemplates.length} default_project_templates records`);

  // project templates
  const projectTemplates = await db.projectTemplate.findMany({
    select: {
      id: true,
      content: true,
    },
  });
  await Promise.all(
    projectTemplates.map((t) =>
      db.projectTemplate.update({
        where: {
          id: t.id,
        },
        data: {
          content: renameTypesAndSubtypes(t.content),
        },
      }),
    ),
  );
  console.log(`Checked and updated ${projectTemplates.length} project_templates records`);

  // project content
  const projectContents = await db.projectContent.findMany({
    select: {
      id: true,
      formFields: true,
    },
  });
  await Promise.all(
    projectContents.map((t) =>
      db.projectContent.update({
        where: {
          id: t.id,
        },
        data: {
          formFields: renameTypesAndSubtypes(t.formFields),
        },
      }),
    ),
  );
  console.log(`Checked and updated ${projectContents.length} project_contents records`);
};

base(fn);

export {};
