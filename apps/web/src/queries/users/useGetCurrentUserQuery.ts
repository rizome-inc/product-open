import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { UserSchema } from "xylem";
import { queryClient } from "../client";

export const USER_BYID_QUERY_KEY = "userById";

export function useGetCurrentUserQuery({
  enabled,
  initialData,
  refetchOnWindowFocus,
}: {
  enabled?: boolean;
  initialData?: UserSchema;
  refetchOnWindowFocus?: boolean;
}) {
  return useQuery({
    enabled,
    initialData,
    queryKey: [USER_BYID_QUERY_KEY],
    queryFn: async () => {
      const res = await apiClient.user.getCurrentUser();

      if (res.status !== 200) {
        throw new Error("Failed to load user");
      }
      return res.body;
    },
    refetchOnWindowFocus,
  });
}

export function invalidateUser() {
  queryClient.invalidateQueries([USER_BYID_QUERY_KEY]);
}
