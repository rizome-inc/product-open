import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../client";

export const GET_PROJECT_APPROVALS_QUERY_KEY = "getProjectApprovals";

export function useProjectApprovalsQuery({
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
    queryKey: [GET_PROJECT_APPROVALS_QUERY_KEY, id],
    queryFn: async () => {
      const res = await apiClient.project.approvals({
        params: {
          id: `${id}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to load approvals");
      }
      return res.body;
    },
    refetchOnWindowFocus,
  });
}

export function invalidateProjectApprovals(id: number) {
  queryClient.invalidateQueries([GET_PROJECT_APPROVALS_QUERY_KEY, id]);
}
