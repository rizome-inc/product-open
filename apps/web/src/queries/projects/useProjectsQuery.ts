import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { ProjectSchema } from "xylem";
import { queryClient } from "../client";

export const GET_PROJECTS_QUERY_KEY = "getProjects";

export function useProjectsQuery({ initialData }: { initialData?: ProjectSchema[] }) {
  return useQuery({
    initialData,
    queryKey: [GET_PROJECTS_QUERY_KEY],
    queryFn: async () => {
      const res = await apiClient.project.getAll();

      if (res.status !== 200) {
        throw new Error("Failed to load projects");
      }
      return res.body;
    },
    refetchOnWindowFocus: false,
  });
}

export function invalidateProjects() {
  queryClient.invalidateQueries([GET_PROJECTS_QUERY_KEY]);
}
