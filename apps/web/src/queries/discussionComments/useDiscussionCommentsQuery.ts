import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../client";

export const GET_DISCUSSION_COMMENTS_QUERY_KEY = "getDiscusssionComments";
const DEFAULT_PAGE_SIZE = 25;

export function useDiscussionCommentsQuery({
  id,
  enabled,
  refetchOnWindowFocus = false,
}: {
  id: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}) {
  const queryKey = [GET_DISCUSSION_COMMENTS_QUERY_KEY, id];
  return useQuery({
    enabled,
    queryKey,
    queryFn: async () => {
      const res = await apiClient.discussion.comments({
        params: {
          id: `${id}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to load comments");
      }
      return res.body;
    },
    refetchOnWindowFocus,
  });
}

export function invalidateDiscussionComments(id: number, pageSize = DEFAULT_PAGE_SIZE) {
  queryClient.invalidateQueries([GET_DISCUSSION_COMMENTS_QUERY_KEY, id, pageSize]);
}
