import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  organizationName: z.string().min(1),
  firstName: z.string().optional().nullable(), // fixme: not used
  lastName: z.string().optional().nullable(), // fixme: not used
});

export type SignupSchema = z.infer<typeof signupSchema>;

export const confirmationQuery = z.object({
  next: z.string().optional()
});

export type ConfirmationQuery = z.infer<typeof confirmationQuery>;