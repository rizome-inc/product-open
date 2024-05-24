import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { CompleteDiscussionSchema } from "xylem";
import { invalidateDiscussion } from "./useDiscussionQuery";

export function useCompleteDiscussionMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({ id, request }: { id: number; request: CompleteDiscussionSchema }) => {
      const res = await apiClient.discussion.complete({
        params: {
          id: `${id}`,
        },
        body: request,
      });

      if (res.status !== 200) {
        throw new Error("Failed to complete discussion");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled(_, error, { id }) {
      if (!error) {
        invalidateDiscussion(id);
      }
    },
  });
}
