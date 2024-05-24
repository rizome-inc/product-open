import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";

const GENERATE_IMAGE_QUERY_KEY = "generateImage";

export function useGenerateImageQuery({
  prompt,
  projectId,
  enabled,
}: {
  prompt: string | undefined;
  projectId: number | undefined;
  enabled: boolean;
}) {
  return useQuery({
    enabled,
    queryKey: [GENERATE_IMAGE_QUERY_KEY, prompt],
    queryFn: async () => {
      if (prompt && projectId !== undefined) {
        const res = await apiClient.project.generateImage({
          body: {
            prompt,
            projectId,
          },
        });

        if (res.status !== 200) {
          throw new Error("Could not generate image");
        }

        return res.body;
      }
    },
  });
}
