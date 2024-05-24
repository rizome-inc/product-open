import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { UserSchema } from "xylem";
import { queryClient } from "../client";

export const USERS_QUERY_KEY = "users";

type UsersQueryOptions = {
  enabled?: boolean;
  initialData?: UserSchema[];
  refetchOnWindowFocus?: boolean;
};
export function useUsersQuery(options: UsersQueryOptions = {}) {
  const { enabled, initialData, refetchOnWindowFocus } = options;
  return useQuery({
    enabled,
    initialData,
    queryKey: [USERS_QUERY_KEY],
    queryFn: async () => {
      const res = await apiClient.user.getAllUsersInMyOrg({
        query: {
          includeDeactivated: true, // fixme: is this passed in anywhere?
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to load template");
      }
      return res.body;
    },
    refetchOnWindowFocus,
  });
}

export function invalidateUsers() {
  queryClient.invalidateQueries([USERS_QUERY_KEY]);
}
