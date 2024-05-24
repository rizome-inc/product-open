import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { DiscussionSchema } from "xylem";
import { queryClient } from "../client";

export const GET_DISCUSSION_QUERY_KEY = "getDiscussion";

export function useDiscussionQuery({
  id,
  initialData,
  enabled,
}: {
  id: number;
  enabled?: boolean;
  initialData?: DiscussionSchema;
}) {
  return useQuery({
    enabled,
    initialData,
    queryKey: [GET_DISCUSSION_QUERY_KEY, id],
    queryFn: async () => {
      const res = await apiClient.discussion.get({
        params: {
          id: `${id}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to fetch discussion");
      }
      return res.body;
    },
    refetchOnWindowFocus: false,
  });
}

export function invalidateDiscussion(id: number) {
  queryClient.invalidateQueries([GET_DISCUSSION_QUERY_KEY, id]);
}
