import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../client";

export const GET_FLOW_PROJECT_QUERY_KEY = "getFlowProject";

export function useFlowProjectQuery({ id, enabled }: { id: number; enabled?: boolean }) {
  return useQuery({
    enabled,
    queryKey: [GET_FLOW_PROJECT_QUERY_KEY, id],
    queryFn: async () => {
      const res = await apiClient.project.getFlow({
        params: {
          id: `${id}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Could not load project");
      }
      return res.body;
    },
    refetchOnWindowFocus: false,
  });
}

export function invalidateProject(id: number) {
  queryClient.invalidateQueries([GET_FLOW_PROJECT_QUERY_KEY, id]);
}
