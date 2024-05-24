import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { TemplateSchema } from "xylem";
import { queryClient } from "../client";
import { GET_PROJECT_TEMPLATE_QUERY_KEY } from "./useProjectTemplateQuery";

export function useProjectTemplateUpdateMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({ id, template }: { id: number; template: TemplateSchema }) => {
      const res = await apiClient.template.update({
        params: {
          id: `${id}`,
        },
        body: template,
      });

      if (res.status !== 200) {
        throw new Error("Failed to update template");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error) => {
      if (!error && data?.id) {
        queryClient.setQueryData([GET_PROJECT_TEMPLATE_QUERY_KEY, data.id], data);
      }
    },
  });
}
