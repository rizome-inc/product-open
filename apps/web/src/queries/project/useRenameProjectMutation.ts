import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { ProjectSchema } from "xylem";
import { queryClient } from "../client";
import { GET_PROJECT_QUERY_KEY } from "./useProjectQuery";

export function useRenameProjectMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiClient.project.rename({
        params: {
          id: `${id}`,
        },
        body: {
          name,
        },
      });

      if (res.status !== 200) {
        throw new Error("Could not rename project");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error, { id }) => {
      if (data && !error) {
        const key = [GET_PROJECT_QUERY_KEY, id];
        if (queryClient.getQueriesData<ProjectSchema>(key)) {
          queryClient.setQueryData(key, (project: Partial<ProjectSchema> | undefined) => {
            return {
              ...(project || {}),
              ...data,
            };
          });
        }
      }
    },
  });
}
