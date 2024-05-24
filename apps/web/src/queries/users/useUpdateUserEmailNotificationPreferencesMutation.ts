import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { UpdateUserPreferencesSchema, UserSchema } from "xylem";
import { queryClient } from "../client";
import { USER_BYID_QUERY_KEY } from "./useGetCurrentUserQuery";

export function useUpdateUserEmailNotificationPreferencesMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (preferences: UpdateUserPreferencesSchema) => {
      const res = await apiClient.user.updatePreferences({
        body: preferences,
      });

      // fixme: figure out error handling
      if (res.status !== 200) {
        throw new Error("Failed to update preferences");
      }

      // update the logged-in user
      // fixme: how is this used?
      queryClient.setQueryData([USER_BYID_QUERY_KEY, "me"], (storedUser?: UserSchema) => {
        if (storedUser) {
          return {
            ...storedUser,
            preferences: {
              ...(storedUser.preferences || {}),
              ...res.body,
            },
          };
        }
      });

      return res.body;
    },
    onError,
    onSuccess,
  });
}
