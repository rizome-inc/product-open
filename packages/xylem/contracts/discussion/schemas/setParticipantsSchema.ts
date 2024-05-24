import { z } from "zod";

export const setDiscussionParticipantsSchema = z.object({
  participantIds: z.array(z.number().int()),
});

export type SetDiscussionParticipantsSchema = z.infer<typeof setDiscussionParticipantsSchema>;
