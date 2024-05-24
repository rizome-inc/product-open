import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { invalidateProjects } from "../projects/useProjectsQuery";
import { invalidateProject } from "./useProjectQuery";

export function usePublishProjectMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (projectId: number) => {
      const res = await apiClient.project.publish({
        params: {
          id: `${projectId}`,
        },
        body: {},
      });

      if (res.status !== 200) {
        throw new Error("Could not publish project");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error, projectId) => {
      if (!error && data) {
        invalidateProjects();
        invalidateProject(projectId);
      }
    },
  });
}
