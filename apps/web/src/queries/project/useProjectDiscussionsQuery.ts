import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../client";

export const GET_PROJECT_DISCUSSIONS_QUERY_KEY = "getProjectDiscussions";

export function useProjectDiscussionsQuery({
  id,
  enabled,
  refetchOnWindowFocus = true,
}: {
  id: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}) {
  return useQuery({
    enabled,
    queryKey: [GET_PROJECT_DISCUSSIONS_QUERY_KEY, id],
    queryFn: async () => {
      const res = await apiClient.project.discussions({
        params: {
          id: `${id}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to load discussions");
      }
      return res.body;
    },
    refetchOnWindowFocus,
  });
}

export function invalidateProjectDiscussions(projectId: number) {
  queryClient.invalidateQueries([GET_PROJECT_DISCUSSIONS_QUERY_KEY, projectId]);
}
