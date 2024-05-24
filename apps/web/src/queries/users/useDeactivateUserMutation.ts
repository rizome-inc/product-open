import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";

export function useDeactivateUserMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.user.delete({
        params: {
          id: `${id}`,
        },
        body: {
          id,
        },
      });

      if (res.status !== 201) {
        throw new Error("Failed to deactivate user");
      }
      return res.body;
    },
    onError,
    onSuccess,
  });
}
