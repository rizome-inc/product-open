import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { CreateContributorSchema, ProjectSchema } from "xylem";
import { queryClient } from "../client";
import { GET_PROJECT_QUERY_KEY } from "./useProjectQuery";

export function useUpdateProjectContributorsMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      id,
      contributors,
    }: {
      id: number;
      contributors: CreateContributorSchema[];
    }) => {
      console.log(contributors);
      const res = await apiClient.project.setContributors({
        params: {
          id: `${id}`,
        },
        body: {
          contributors,
        },
      });

      if (res.status !== 200) {
        throw new Error("Could not set contributors");
      }
      console.log("set contrib response", res.body);
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
              contributors: data,
            };
          });
        }
      }
    },
  });
}
