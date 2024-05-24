import { useDiscussionContext } from "@/context/discussion";
import {
  DiscussionCommentsContext,
  useDiscussionCommentsContextController,
} from "@/context/discussionComments";
import { DiscussionCommentInputField, DiscussionCommentsList } from "./presentation";

// fixme: I should be able to make this way simpler by removing pagination support. should pass comments into state from query, etc
export function DiscussionComments() {
  const { discussion } = useDiscussionContext();
  const context = useDiscussionCommentsContextController({
    discussionId: discussion?.id ?? undefined,
  });

  return (
    <DiscussionCommentsContext.Provider value={context}>
      <DiscussionCommentInputField />
      <DiscussionCommentsList sx={{ mt: 2, flexGrow: 1 }} />
    </DiscussionCommentsContext.Provider>
  );
}
