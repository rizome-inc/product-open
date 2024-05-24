import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { UpdateDiscussionSchema } from "xylem";
import { invalidateDiscussion } from "./useDiscussionQuery";

export function useUpdateDiscussionMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({ id, request }: { id: number; request: UpdateDiscussionSchema }) => {
      const res = await apiClient.discussion.update({
        params: {
          id: `${id}`,
        },
        body: request,
      });

      if (res.status !== 200) {
        throw new Error("Failed to update discussion");
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
