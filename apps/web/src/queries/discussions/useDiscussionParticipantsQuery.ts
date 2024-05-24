import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../client";

export const GET_DISCUSSION_PARTICIPANTS_QUERY_KEY = "getDiscussionParticipants";

export function useDiscussionParticipantsQuery({ id, enabled }: { id: number; enabled?: boolean }) {
  return useQuery({
    enabled,
    queryKey: [GET_DISCUSSION_PARTICIPANTS_QUERY_KEY, id],
    queryFn: async () => {
      const res = await apiClient.discussion.getParticipants({
        params: {
          id: `${id}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to get participants");
      }
      return res.body;
    },
    refetchOnWindowFocus: false,
  });
}

export function invalidateDiscussionParticipants(id: number) {
  queryClient.invalidateQueries([GET_DISCUSSION_PARTICIPANTS_QUERY_KEY, id]);
}
