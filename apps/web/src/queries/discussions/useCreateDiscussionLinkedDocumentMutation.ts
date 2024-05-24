import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { CreateLinkedDocumentSchema } from "xylem";
import { invalidateDiscussion } from "./useDiscussionQuery";

export function useCreateDiscussionLinkedDocumentMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      id,
      linkedDocument,
    }: {
      id: number;
      linkedDocument: CreateLinkedDocumentSchema;
    }) => {
      const res = await apiClient.discussion.linkDocument({
        params: {
          id: `${id}`,
        },
        body: linkedDocument,
      });

      if (res.status !== 201) {
        throw new Error("Failed to link document");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error, { id }) => {
      if (!error && data) {
        invalidateDiscussion(id);
      }
    },
  });
}
