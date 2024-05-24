import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { invalidateDiscussion } from "./useDiscussionQuery";

export function useRemoveDiscussionFileAttachmentMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      discussionId,
      attachmentId,
    }: {
      discussionId: number;
      attachmentId: number;
    }) => {
      const res = await apiClient.discussion.deleteAttachment({
        params: {
          discussionId: `${discussionId}`,
          attachmentId: `${attachmentId}`,
        },
        body: {
          discussionId: `${discussionId}`,
          attachmentId: `${attachmentId}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to delete attachment");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error, { discussionId }) => {
      if (!error && data) {
        invalidateDiscussion(discussionId);
      }
    },
  });
}
