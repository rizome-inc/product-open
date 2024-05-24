import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { ProjectApprovalResponseSchema } from "xylem";
import { invalidateProjects } from "../projects/useProjectsQuery";
import { invalidateProjectApprovals } from "./useProjectApprovalsQuery";

export function useAddProjectApprovalMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      id,
      approval,
    }: {
      id: number;
      approval: ProjectApprovalResponseSchema;
    }) => {
      const res = await apiClient.project.approve({
        params: {
          id: `${id}`,
        },
        body: approval,
      });

      if (res.status !== 200) {
        console.error(res.body);
        throw new Error("Failed to approve project");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled: (data, error, { id }) => {
      if (!error && data) {
        invalidateProjects();
        invalidateProjectApprovals(id);
      }
    },
  });
}
