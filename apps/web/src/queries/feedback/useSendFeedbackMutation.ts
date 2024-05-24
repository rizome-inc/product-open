import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { AddFeedbackSchema } from "xylem";

export function useSendFeedbackMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (request: AddFeedbackSchema) => {
      const res = await apiClient.feedback.giveFeedback({
        body: request,
      });

      if (res.status !== 201) {
        throw new Error("Failed to give feedback");
      }
      return res.body;
    },
    onError,
    onSuccess,
  });
}
