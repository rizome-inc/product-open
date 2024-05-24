import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { UpdateLinkedDocumentSchema } from "xylem";
import { invalidateDiscussion } from "./useDiscussionQuery";

export function useUpdateDiscussionLinkedDocumentMutation({
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
      request,
    }: {
      discussionId: number;
      documentId: number;
      request: UpdateLinkedDocumentSchema;
    }) => {
      const res = await apiClient.discussion.updateLinkedDocument({
        params: {
          discussionId: `${discussionId}`,
          documentId: `${documentId}`,
        },
        body: request,
      });

      if (res.status !== 200) {
        throw new Error("Failed to update linked document");
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
