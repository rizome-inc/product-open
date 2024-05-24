import { userSchema } from "../../user/schemas/userSchema";
import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";
import { ContributorRole } from "../../common/enums";
import { z } from "zod";

export const createContributorSchema = z.object({
  projectId: z.number().int().min(1),
  role: z.nativeEnum(ContributorRole),
  status: z.string().optional(),
  userId: z.number().int().min(1),
});

export type CreateContributorSchema = z.infer<typeof createContributorSchema>;

export const updateContributorSchema = createContributorSchema.partial();

export type UpdateContributorSchema = z.infer<typeof updateContributorSchema>;

export const contributorSchema = baseApiModelSchema.extend({
  role: z.nativeEnum(ContributorRole),
  status: z.string().optional(),
  user: userSchema.pick({
    email: true,
    firstName: true,
    id: true,
    lastName: true,
    status: true,
    roles: true,
  }),
});

// export const contributorSchema = baseApiModelSchema.merge(createContributorSchema).extend({
//   user: userSchema.partial().optional(),
// });

export type ContributorSchema = z.infer<typeof contributorSchema>;
