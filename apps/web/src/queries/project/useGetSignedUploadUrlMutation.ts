import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";

export function useGetSignedUploadUrlMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({ projectId, fileName }: { projectId: number; fileName: string }) => {
      const res = await apiClient.project.getSignedUploadUrl({
        params: {
          id: `${projectId}`,
        },
        body: {
          fileName,
        },
      });

      if (res.status !== 200) {
        throw new Error("Could not update get upload url");
      }
      return res.body;
    },
    onError,
    onSuccess,
  });
}
