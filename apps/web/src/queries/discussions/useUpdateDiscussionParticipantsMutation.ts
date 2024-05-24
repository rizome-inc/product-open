import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../client";
import { GET_DISCUSSION_PARTICIPANTS_QUERY_KEY } from "./useDiscussionParticipantsQuery";

export function useUpdateDiscussionParticipantsMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async ({ id, participantIds }: { id: number; participantIds: number[] }) => {
      const res = await apiClient.discussion.setParticipants({
        params: {
          id: `${id}`,
        },
        body: {
          participantIds,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to set participants");
      }
      return res.body;
    },
    onError,
    onSuccess,
    onSettled(data, error, { id }) {
      if (!error) {
        queryClient.setQueryData([GET_DISCUSSION_PARTICIPANTS_QUERY_KEY, id], () => {
          return data;
        });
      }
    },
  });
}
