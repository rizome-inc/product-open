import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { CreateProjectFromTemplateSchema } from "xylem";
import { invalidateProjects } from "./useProjectsQuery";

export function useCreateProjectFromTemplateMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (request: CreateProjectFromTemplateSchema) => {
      const res = await apiClient.project.create({
        body: request,
      });

      if (res.status !== 201) {
        throw new Error("Failed to load template");
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
