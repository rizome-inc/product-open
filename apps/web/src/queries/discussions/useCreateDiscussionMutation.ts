import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { CreateDiscussionSchema } from "xylem";
import { invalidateProjectDiscussions } from "../project";

export function useCreateDiscussionMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({ body }: { body: CreateDiscussionSchema }) => {
      const res = await apiClient.discussion.create({
        body,
      });

      if (res.status !== 201) {
        throw new Error("Failed to create discussion");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error, { body }) => {
      if (!error && data) {
        invalidateProjectDiscussions(body.projectId);
      }
    },
  });
}
