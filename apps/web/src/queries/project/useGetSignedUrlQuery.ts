import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";

const GET_SIGNED_URL_QUERY_KEY = "getSignedUrl";

export function useGetSignedUrlQuery({
  path,
  enabled,
}: {
  path: string | undefined;
  enabled: boolean;
}) {
  return useQuery({
    enabled,
    queryKey: [GET_SIGNED_URL_QUERY_KEY, path],
    queryFn: async () => {
      if (path) {
        const res = await apiClient.project.getSignedUrl({
          body: {
            path,
          },
        });

        if (res.status !== 200) {
          throw new Error("Could not get signed url");
        }

        return res.body;
      }
    },
  });
}
