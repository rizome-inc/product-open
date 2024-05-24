import apiClient from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TemplateSchema } from "xylem";
import { GET_PROJECT_TEMPLATE_QUERY_KEY } from "./useProjectTemplateQuery";

export function useCreateProjectTemplateMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ template }: { template: TemplateSchema }) => {
      const res = await apiClient.template.create({
        body: template,
      });

      if (res.status !== 201) {
        throw new Error("Failed to create project template");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error) => {
      if (!error && data) {
        queryClient.setQueryData([GET_PROJECT_TEMPLATE_QUERY_KEY, data.id], data);
      }
    },
  });
}
