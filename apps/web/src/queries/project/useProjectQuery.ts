import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { ProjectByIdQuerySchema } from "xylem";
import { queryClient } from "../client";

export const GET_PROJECT_QUERY_KEY = "getProject";

export function useProjectQuery({
  id,
  enabled,
  include,
}: {
  id: number;
  enabled?: boolean;
  include?: ProjectByIdQuerySchema;
}) {
  return useQuery({
    enabled,
    queryKey: [GET_PROJECT_QUERY_KEY, id],
    queryFn: async () => {
      const res = await apiClient.project.get({
        params: {
          id: `${id}`,
        },
        query: {
          ...include,
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
  queryClient.invalidateQueries([GET_PROJECT_QUERY_KEY, id]);
}
