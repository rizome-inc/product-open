import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { UpdateUserSchema, UserSchema } from "xylem";

export function useUpdateUserMutation({
  onError,
}: {
  onError?: (error: Error) => void;
  onSuccess?: (user: UserSchema) => void;
} = {}) {
  return useMutation({
    mutationFn: async (request: { id: number; user: UpdateUserSchema }) => {
      const res = await apiClient.user.update({
        params: {
          id: `${request.id}`,
        },
        body: request.user,
      });

      if (res.status !== 200) {
        throw new Error("Failed to update user");
      }
      return res.body;
    },
    onError,
    onSuccess: () => {
      // fixme: this is a weird check
      // if (fetchedUser.organizationId) {
      // 	queryClient.cancelQueries([USER_BYID_QUERY_KEY, variables.id]);
      // 	queryClient.setQueryData([USER_BYID_QUERY_KEY, variables.id], () => fetchedUser);
      // 	invalidateUsers();
      //   onSuccess?.(fetchedUser);
      // }
    },
  });
}
