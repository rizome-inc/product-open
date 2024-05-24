import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { CreateFlowProjectSchema } from "xylem";
import { invalidateProjects } from "./useProjectsQuery";

export function useCreateFlowProjectMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (request: CreateFlowProjectSchema) => {
      const res = await apiClient.project.createFlow({
        body: request,
      });

      if (res.status !== 201) {
        throw new Error("Failed to create project");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error) => {
      if (!error && data) {
        invalidateProjects();
      }
    },
  });
}
