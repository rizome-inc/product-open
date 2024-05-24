import { BasePageActionButton } from "@/components/BasePageActionButton";
import { BasePageActionsMenuButton } from "@/components/BasePageActionsMenuButton";
import { BulletList } from "@/components/BulletList";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DicussionContent } from "@/components/discussion/DiscussionContent";
import { DiscussionEditParticipantsModal } from "@/components/discussion/DiscussionEditParticipantsModal";
import { DiscussionMarkCompleteModal } from "@/components/discussion/DiscussionMarkCompleteModal";
import { DiscussionName } from "@/components/discussion/DiscussionName";
import { DiscussionOutcome } from "@/components/discussion/DiscussionOutcome";
import { DiscussionTopic } from "@/components/discussion/DiscussionTopic";
import {
  DiscussionActiveModalType,
  DiscussionContext,
  DiscussionEditingContext,
  useDiscussionContextController,
  useDiscussionEditingContextController,
} from "@/context/discussion";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { BasePageLayout } from "@/layouts/BasePageLayout";
import { getEntityDisplayName } from "@/util/misc";
import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import * as React from "react";

function Discussion() {
  const { showErrorModal } = useErrorModalContext();
  const router = useRouter();
  const { toastSuccess } = useToaster();

  const projectId = parseInt(router.query.projectId as string, 10);
  const discussionId = parseInt(router.query.discussionId as string, 10);

  const context = useDiscussionContextController({
    projectId,
    discussionId,
  });
  const { discussion, project, participants, setActiveModal, activeModal, canEdit } = context;

  const editingContext = useDiscussionEditingContextController(context.discussion);
  const { setIsEditing, isEditing, isUpdatingDiscussion, saveEditsAsync } = editingContext;

  React.useEffect(() => {
    if (router.query.edit === "true") {
      if (canEdit) {
        editingContext.setIsEditing(true);
      }
      // remove query
      router.replace(router.asPath.split("?")[0], undefined, { shallow: true });
    }
  }, [canEdit, editingContext, router.query, router]);

  const onSaveContent = async () => {
    try {
      await saveEditsAsync();
      setIsEditing(false);
      toastSuccess("Discussion saved.");
    } catch (error) {
      showErrorModal(error);
    }
  };
  return (
    <DiscussionContext.Provider value={context}>
      <DiscussionEditingContext.Provider value={editingContext}>
        <BasePageLayout
          actions={
            isEditing ? (
              <>
                <BasePageActionButton
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdatingDiscussion}
                  variant="outlined"
                >
                  Cancel
                </BasePageActionButton>
                <LoadingActionButton
                  onClick={onSaveContent}
                  disabled={isUpdatingDiscussion}
                  variant="contained"
                >
                  Save
                </LoadingActionButton>
              </>
            ) : (
              <BasePageActionsMenuButton title="Actions">
                <MenuItem onClick={() => setIsEditing(true)}>{"Edit"}</MenuItem>
                <MenuItem
                  onClick={() => setActiveModal(DiscussionActiveModalType.EditParticipants)}
                >
                  {"Edit participants"}
                </MenuItem>
                {!discussion?.completedAt ? (
                  <MenuItem
                    id="completeDiscussionStart"
                    onClick={() => setActiveModal(DiscussionActiveModalType.MarkAsComplete)}
                  >
                    {"Mark as complete"}
                  </MenuItem>
                ) : null}
              </BasePageActionsMenuButton>
            )
          }
          onRenderBreadcrumbPathComponent={(pathComp, index, pathComps) => {
            if (pathComp === "[projectId]") {
              return project?.name ? project?.name : "Project";
            }
            if (index === pathComps.length - 1) {
              return discussion?.name ? discussion?.name : "Discussion";
            } else if (pathComp === "discussion") {
              return false;
            }
            return null; // do the default
          }}
          title={
            discussion?.name ? (
              `Discussion: ${discussion?.name}`
            ) : (
              <Stack direction="row" spacing={1}>
                <Typography variant="h1">Discussion:</Typography>
                <Skeleton width={100} height={48} />
              </Stack>
            )
          }
        >
          {context.isLoadingDiscussion ? (
            <LoadingSpinner absoluteCenterPosition={true} />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: { sm: "row", xs: "column" },
                gap: 4,
                marginTop: 2,
              }}
            >
              <Paper
                elevation={2}
                sx={() => ({ width: { sm: "40%", xs: "100%" }, padding: "24px" })}
              >
                <DiscussionName />
                <DiscussionTopic />
                <div>
                  <Typography variant="em">Participants</Typography>
                  <BulletList sx={{ mb: 1 }}>
                    {participants?.map((participant) => {
                      return (
                        <ListItem key={participant?.id}>
                          {getEntityDisplayName(participant)}
                        </ListItem>
                      );
                    })}
                  </BulletList>
                </div>
                <DiscussionOutcome />
              </Paper>
              <Paper
                elevation={2}
                sx={() => ({
                  width: { sm: "60%", xs: "100%" },
                  padding: "24px",
                  paddingTop: "8px",
                })}
              >
                <DicussionContent />
              </Paper>
            </Box>
          )}
          <DiscussionMarkCompleteModal
            open={activeModal === DiscussionActiveModalType.MarkAsComplete}
            onRequestClose={() => {
              setActiveModal(DiscussionActiveModalType.Unset);
            }}
          />
          <DiscussionEditParticipantsModal
            open={activeModal === DiscussionActiveModalType.EditParticipants}
            onRequestClose={() => {
              setActiveModal(DiscussionActiveModalType.Unset);
            }}
          />
        </BasePageLayout>
      </DiscussionEditingContext.Provider>
    </DiscussionContext.Provider>
  );
}

export default Discussion;
