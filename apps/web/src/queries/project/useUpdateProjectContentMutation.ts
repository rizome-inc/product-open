import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { ProjectContentSchema, WorkTrackingSchema } from "xylem";
import { invalidateProject } from "./useProjectQuery";

export function useUpdateProjectContentMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({
      id,
      content,
      workTracking,
    }: {
      id: number;
      content: ProjectContentSchema;
      workTracking?: WorkTrackingSchema | null;
    }) => {
      const res = await apiClient.project.updateContent({
        params: {
          id: `${id}`,
        },
        body: {
          workTrackingName: workTracking ? workTracking.workTrackingName : undefined,
          workTrackingUrl: workTracking ? workTracking.workTrackingUrl : undefined,
          content,
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
