import { Prisma, ProjectTemplate, TemplateScope } from "@prisma/client";
import { TemplateSchema, projectContentSchema, TemplateScope as XylemTemplateScope } from "xylem";

export const templateToXylem = (data: ProjectTemplate): TemplateSchema => {
  const { organizationId, ...rest } = data;
  return {
    ...rest,
    type: "project", // todo: reevaluate whether this is necessary
    content: projectContentSchema.parse(data.content),
    scope: data.scope as XylemTemplateScope,
  };
};

// fixme: the contract should specify the omission of these fields
export const templateToPrismaInput = (
  template: TemplateSchema,
): Omit<
  Prisma.ProjectTemplateUncheckedCreateInput,
  "creatorId" | "organizationId" | "id" | "createdAt" | "updatedAt"
> => {
  const { active, content, contentVersion, description, example, name, scope } = template;
  return {
    active: active || true,
    content: content ? (content as Prisma.InputJsonValue) : (content as Prisma.NullTypes.JsonNull),
    contentVersion,
    description,
    example,
    name,
    scope: scope ? (scope as TemplateScope) : undefined,
  };
};
