import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { MentionInputField } from "@/components/MentionInputField";
import { MentionTemplate } from "@/components/MentionInputField/models";
import { useDiscussionContext } from "@/context/discussion";
import { useDiscussionCommentsContext } from "@/context/discussionComments";
import { useErrorModalContext } from "@/context/errorModals";
import { useUsersQuery } from "@/queries";
import { getEntityDisplayName } from "@/util/misc";
import { Chip, SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import moment from "moment";
import * as React from "react";
import { MentionItem } from "react-mentions";
import {
  DiscussionCommentContentSchema,
  DiscussionCommentMentionSchema,
  DiscussionCommentSchema,
} from "xylem";

export function DiscussionCommentInputField() {
  const { discussion } = useDiscussionContext();
  const { createCommentMutation, setComments } = useDiscussionCommentsContext();

  const { showErrorModal } = useErrorModalContext();
  const [showingInput, setShowingInput] = React.useState<boolean>(true);

  const [comment, setComment] = React.useState<DiscussionCommentContentSchema>({
    value: "",
  });

  const reset = () =>
    setComment({
      value: "",
    });

  const onSaveClicked = async () => {
    if (discussion?.id) {
      try {
        const commentResponse = await createCommentMutation.mutateAsync({
          discussionId: discussion.id,
          comment,
        });
        setComments((cs) => [commentResponse, ...cs]); // new comments are added in reverse chronological order
        reset();
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  const onInputChanged = (
    e: { target: { value: string } },
    _: string,
    __: string,
    mentions: MentionItem[],
  ) => {
    setComment((v) => {
      const next: DiscussionCommentContentSchema = {
        ...v,
        value: e.target.value,
      };
      if (mentions) {
        const idToMentionCollection: Record<string, DiscussionCommentMentionSchema> = {};
        mentions.forEach((x) => {
          if (!idToMentionCollection[x.id]) {
            idToMentionCollection[x.id] = {
              userId: parseInt(x.id, 10),
              replacementText: x.display,
              token: MentionTemplate.replace("__id__", x.id).replace("__display__", x.display),
            };
          }
        });
        next.mentions = Object.values(idToMentionCollection);
      } else {
        delete next.mentions;
      }
      return next;
    });
  };
  return (
    <Stack direction={"column"} spacing={2} sx={{ marginBottom: 3, marginTop: 1 }}>
      {showingInput ? (
        <>
          <MentionInputField value={comment?.value} onChange={onInputChanged} />
          <Stack direction={"row"} spacing={1.5}>
            <LoadingActionButton
              id="commentDiscussionFinish"
              variant="contained"
              onClick={onSaveClicked}
              disabled={!comment?.value}
            >
              Send
            </LoadingActionButton>
          </Stack>
        </>
      ) : (
        <Button
          id="commentDiscussionStart"
          sx={{ alignSelf: "flex-start" }}
          variant="outlined"
          onClick={() => setShowingInput(true)}
        >
          Comment
        </Button>
      )}
    </Stack>
  );
}

function DiscussionCommentsListItem({ comment }: { comment: DiscussionCommentSchema }) {
  const { data: users } = useUsersQuery();

  const content = React.useMemo(() => {
    if (!comment.content.mentions?.length) {
      return <ReadOnlyText value={comment.content.value} />;
    }

    const tokenToMentionMap = comment.content.mentions.reduce<
      Record<string, DiscussionCommentMentionSchema>
    >((res, mention) => {
      res[mention.token] = mention;
      return res;
    }, {});

    // parse out the mentions into styled Typography elements
    // fixme: wtf
    const parser = new DOMParser();
    const body = parser.parseFromString(comment.content.value, "text/html").body;
    const output: (string | DiscussionCommentMentionSchema)[] = [];
    let cursor = 0;

    const elements = body.querySelectorAll("*");
    elements?.forEach((element) => {
      const elementStringValue = element.outerHTML;
      const index = comment.content.value.indexOf(elementStringValue, cursor);
      const stringBeforeElement = comment.content.value.substring(cursor, index);
      if (stringBeforeElement) {
        output.push(stringBeforeElement);
      }

      const mention = tokenToMentionMap[elementStringValue];
      output.push(mention ?? elementStringValue);

      cursor = index + elementStringValue.length;
    });

    const end = comment.content.value.substring(cursor);
    if (end) {
      output.push(end);
    }

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", whiteSpace: "pre", width: "100%" }}>
        {output.map((x, i) => {
          if (typeof x === "string") {
            return (
              <Typography key={i} component={"span"}>
                {x}
              </Typography>
            );
          }
          const user = users?.find((user) => user.id === x.userId);
          return (
            <Chip
              label={user ? getEntityDisplayName(user) : undefined}
              key={i}
              component={"span"}
              sx={{ height: "22px", borderRadius: "4px" }}
            />
          );
        })}
      </Box>
    );
  }, [comment.content.mentions, comment.content.value, users]);
  return (
    <Box>
      <Box sx={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
        <Typography variant="em">
          {comment.creator?.firstName || comment.creator?.email || ""}
        </Typography>
        <Typography variant="tertiary">
          {moment(comment.createdAt).format("hh:mm A \u2014 MMM D")}
        </Typography>
      </Box>
      <Box sx={{ mt: 1 }}>{content}</Box>
    </Box>
  );
}

export function DiscussionCommentsList({ sx }: { sx?: SxProps }) {
  // const [comments, setComments] = React.useState<DiscussionCommentSchema[]>([]);
  // const commentsQuery = useDiscussionCommentsQuery({
  // 	id: discussionId,
  // });
  const { comments } = useDiscussionCommentsContext();
  // React.useEffect(() => {
  //   if (commentsQuery.data) {
  //     setComments(commentsQuery.data.values)
  //   }
  // }, [commentsQuery.data])
  // const onWaypointChanged = (inView: boolean) => {
  // 	if (inView && !commentsQuery.isFetching && commentsQuery.hasNextPage) {
  // 		commentsQuery.fetchNextPage();
  // 	}
  // };

  // TODO: move this logic to the query
  // const idCache = new Set<number>();
  return (
    <Stack direction={"column"} spacing={2} sx={sx}>
      {comments &&
        comments.map((comment) => {
          return (
            <DiscussionCommentsListItem key={comment.id} comment={comment} />
            // <React.Fragment key={`${response.body.pageToken || ''}-i`}>
            // 	{response.body.values?.map(comment => {
            // 		if (idCache.has(comment.id!)) {
            // 			return null;
            // 		}
            // 		idCache.add(comment.id!);
            // 		return <DiscussionCommentsListItem key={comment.id} comment={comment} />;
            // 	})}
            // </React.Fragment>
          );
        })}
      {/* <Waypoint onChange={onWaypointChanged} /> */}
    </Stack>
  );
}
