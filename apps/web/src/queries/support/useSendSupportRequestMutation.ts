import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { SupportSchema } from "xylem";

export function useSendSupportRequestMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (request: SupportSchema) => {
      const res = await apiClient.support.request({
        body: request,
      });

      if (res.status !== 201) {
        throw new Error("Failed to create support request");
      }
      return res.body;
    },
    onError,
    onSuccess,
  });
}
