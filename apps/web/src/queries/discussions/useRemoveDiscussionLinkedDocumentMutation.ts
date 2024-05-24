import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { invalidateDiscussion } from "./useDiscussionQuery";

export function useRemoveDiscussionLinkedDocumentMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      discussionId,
      documentId,
    }: {
      discussionId: number;
      documentId: number;
    }) => {
      const res = await apiClient.discussion.deleteLinkedDocument({
        params: {
          discussionId: `${discussionId}`,
          documentId: `${documentId}`,
        },
        body: {
          discussionId,
          documentId,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to delete linked document");
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
