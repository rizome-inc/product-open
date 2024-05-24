import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { WorkTrackingSchema } from "xylem";
import { invalidateProject } from "./useProjectQuery";

export function useUpdateFlowProjectMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      id,
      workTracking,
    }: {
      id: number;
      workTracking?: WorkTrackingSchema | null;
    }) => {
      const res = await apiClient.project.updateFlowContent({
        params: {
          id: `${id}`,
        },
        body: {
          workTrackingName: workTracking ? workTracking.workTrackingName : undefined,
          workTrackingUrl: workTracking ? workTracking.workTrackingUrl : undefined,
        },
      });

      if (res.status !== 200) {
        throw new Error("Could not update project");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled(_, error, { id }) {
      if (!error) {
        invalidateProject(id);
      }
    },
  });
}
