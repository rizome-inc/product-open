import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { DiscussionCommentContentSchema } from "xylem";
import { invalidateDiscussionParticipants } from "../discussions";
import { invalidateDiscussionComments } from "./useDiscussionCommentsQuery";

export function useCreateDiscussionCommentMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      discussionId,
      comment,
    }: {
      discussionId: number;
      comment: DiscussionCommentContentSchema;
    }) => {
      const res = await apiClient.discussion.comment({
        params: {
          id: `${discussionId}`,
        },
        body: comment,
      });

      if (res.status !== 201) {
        invalidateDiscussionComments(+discussionId);
        if (comment.mentions?.length) {
          invalidateDiscussionParticipants(+discussionId);
        }
        throw new Error("Failed to create discussion");
      }
      return res.body;
    },
    onError,
    onSuccess,
  });
}
