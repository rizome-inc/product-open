import { useContextGuard } from "@/hooks/contextGuard";
import { useCreateDiscussionCommentMutation, useDiscussionCommentsQuery } from "@/queries";
import * as React from "react";
import { DiscussionCommentSchema } from "xylem";

export function useDiscussionCommentsContextController({
  discussionId,
}: {
  discussionId?: number;
}) {
  const [comments, setComments] = React.useState<DiscussionCommentSchema[]>([]);
  const commentsQuery = useDiscussionCommentsQuery({
    id: discussionId || -1,
    enabled: Boolean(discussionId),
    // pageSize: 25,
  });
  React.useEffect(() => {
    if (commentsQuery.data) {
      setComments(commentsQuery.data.values);
    }
  }, [commentsQuery.data]);
  const createCommentMutation = useCreateDiscussionCommentMutation();
  return {
    commentsQuery,
    createCommentMutation,
    comments,
    setComments,
  } as const;
}

export const DiscussionCommentsContext = React.createContext<ReturnType<
  typeof useDiscussionCommentsContextController
> | null>(null);

export const useDiscussionCommentsContext = () =>
  useContextGuard(DiscussionCommentsContext, "DiscussionContext");
