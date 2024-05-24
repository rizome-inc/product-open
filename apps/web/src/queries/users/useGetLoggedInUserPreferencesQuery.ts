import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { UserPreferencesSchema, UserSchema } from "xylem";
import { queryClient } from "../client";
import { USER_BYID_QUERY_KEY } from "./useGetCurrentUserQuery";

export const GET_USER_PREFERENCES_QUERY_KEY = "userPreferences";

export function useGetLoggedInUserPreferencesQuery({
  enabled = true,
  initialData,
  refetchOnWindowFocus = false,
}: {
  enabled?: boolean;
  initialData?: UserPreferencesSchema;
  refetchOnWindowFocus?: boolean;
}) {
  return useQuery({
    enabled,
    initialData,
    queryKey: [GET_USER_PREFERENCES_QUERY_KEY],
    queryFn: async () => {
      const res = await apiClient.user.preferences();

      if (res.status !== 200) throw new Error("Failed to fetch preferences");

      // update the logged-in user
      queryClient.setQueryData([USER_BYID_QUERY_KEY, "me"], (storedUser?: UserSchema) => {
        if (storedUser) {
          return { ...storedUser, preferences: res.body };
        }
      });

      return res.body;
    },
    refetchOnWindowFocus,
  });
}

export function invalidateUserPreferences() {
  queryClient.invalidateQueries([GET_USER_PREFERENCES_QUERY_KEY]);
}
