import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { ConfirmationQuery } from "xylem";

export function useProcessMagicLinkMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (query: ConfirmationQuery) => {
      const res = await apiClient.auth.confirm({
        query,
      });

      if (res.status === 303) {
        return res.body;
      } else if (res.status === 302) {
        return res.body;
      } else {
        const error = `Failed to sign in: ${JSON.stringify(res.body)}`;
        console.error(error);
        return {
          url: "/signin",
          message: error,
        };
      }
    },
    onError,
    onSuccess,
  });
}
