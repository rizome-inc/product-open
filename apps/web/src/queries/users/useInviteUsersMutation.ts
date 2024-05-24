import apiClient from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InviteUsersSchema, UserSchema } from "xylem";
import { USERS_QUERY_KEY } from "./useUsersQuery";

export function useInviteUsersMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: (users: UserSchema[]) => void;
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: InviteUsersSchema) => {
      const res = await apiClient.user.invite({
        body: request,
      });

      if (res.status !== 200) {
        throw new Error("Failed to invite users");
      }
      return res.body;
    },
    onError,
    onSuccess: (users) => {
      queryClient.invalidateQueries([USERS_QUERY_KEY]);
      onSuccess?.(users);
    },
  });
}
