import { useUserSessionContext } from "@/hooks/userSession";
import "@liveblocks/react-comments/styles.css";
import { Box, Stack } from "@mui/system";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";

import { BasePageActionButton } from "@/components/BasePageActionButton";
import { BasePageActionsMenuButton } from "@/components/BasePageActionsMenuButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PublishFlowProjectModal } from "@/components/Project/PublishFlowProjectModal";
import { RenameProjectModal } from "@/components/Project/RenameProjectModal";
import { ShareFlowProjectModal } from "@/components/Project/ShareFlowProjectModal";
import { useErrorModalContext } from "@/context/errorModals";
import {
  FlowProjectContext,
  FlowProjectEditingContext,
  ProjectModalType,
  useFlowProjectContextController,
  useFlowProjectEditingContextController,
} from "@/context/flowProject";
import Flow from "@/flow/components/Flow";
import Room from "@/flow/components/Room";
import { BasePageLayout } from "@/layouts/BasePageLayout";
import { MenuItem, Paper, Skeleton, Typography } from "@mui/material";
import "reactflow/dist/style.css";
import { ContributorRole } from "xylem";

/**
 * Liveblocks notes
 * - The default page fn (named whatever) needs to be separate from the rendered component that accesses the RoomProvider
 *   (so can't just export one giant Flow component)
 */

export default function Page() {
  const { user, isAdmin } = useUserSessionContext();
  const { showErrorModal } = useErrorModalContext();

  const router = useRouter();

  const projectId = parseInt(router.query.projectId as string, 10);

  const context = useFlowProjectContextController({
    id: projectId,
  });
  const { isLoading, project, activeModal, setActiveModal } = context;

  const editingContext = useFlowProjectEditingContextController(project);

  const isContributor =
    isAdmin ||
    project?.contributors?.some(
      (x) =>
        x.user?.id === user?.id &&
        (x.role === ContributorRole.Contributor || x.role === ContributorRole.Owner),
    );

  useEffect(() => {
    if (isContributor && router.query.edit === "true") {
      editingContext.setIsEditing(true);
      // remove query
      router.replace(router.asPath.split("?")[0], undefined, { shallow: true });
    }
  }, [isContributor, editingContext, router.query, router]);

  const onCloseModal = () => {
    setActiveModal(ProjectModalType.Unset);
  };

  const closeRenameModal = (newName?: string) => {
    if (typeof newName == "string" && newName.length > 0 && project) {
      project.name = newName;
    }
    onCloseModal();
  };

  // const onSaveContent = async () => {
  //   try {
  //     workTrackingSchema.parse(editingContext.workTracking);
  //     editingContext.setIsSaving(true);
  //     await editingContext.updateProjectContentAsync();
  //     editingContext.setIsSaving(false); // because above is a callback
  //     editingContext.setIsEditing(false);
  //   } catch (error) {
  //     showErrorModal(error);
  //   }
  // };

  return (
    <FlowProjectContext.Provider value={context}>
      <FlowProjectEditingContext.Provider value={editingContext}>
        <BasePageLayout
          actions={
            project?.id && isContributor ? (
              editingContext.isEditing ? (
                <>
                  <BasePageActionButton
                    id="editProjectCancel"
                    onClick={() => editingContext.setIsEditing(false)}
                    disabled={editingContext.isUpdatingProjectContent}
                    variant="outlined"
                  >
                    Stop Editing
                  </BasePageActionButton>
                </>
              ) : (
                <BasePageActionsMenuButton title="Actions">
                  <MenuItem
                    id="editProjectStart"
                    onClick={() => editingContext.setIsEditing(!editingContext.isEditing)}
                  >
                    {"Edit Project"}
                  </MenuItem>
                  <MenuItem onClick={() => setActiveModal(ProjectModalType.Rename)}>
                    {"Rename"}
                  </MenuItem>
                  <MenuItem
                    id="shareProjectStart1"
                    onClick={() => setActiveModal(ProjectModalType.Share)}
                  >
                    {"Share"}
                  </MenuItem>
                  {/* {project.publishedAt ? null : (
                    <MenuItem
                      id="publishProjectStart"
                      onClick={() => setActiveModal(ProjectModalType.Publish)}
                    >
                      {"Publish"}
                    </MenuItem>
                  )} */}
                </BasePageActionsMenuButton>
              )
            ) : undefined
          }
          hideDefaultActions={editingContext.isEditing}
          onRenderBreadcrumbPathComponent={(pathComp, index, pathComps) => {
            if (index === pathComps.length - 1) {
              return project?.name ? project?.name : "Project";
            }
            return null; // do the default
          }}
          title={
            project?.name ? (
              `Project: ${project?.name}`
            ) : (
              <Stack direction="row" spacing={1}>
                <Typography variant="h1">Project:</Typography>
                <Skeleton width={100} height={48} />
              </Stack>
            )
          }
        >
          {isLoading ? (
            <LoadingSpinner absoluteCenterPosition={true} />
          ) : (
            <Box
              sx={() => ({
                display: "flex",
                flexDirection: { sm: "row", xs: "column" },
                gap: 4,
                marginTop: 2,
              })}
            >
              {/* <Paper elevation={2} sx={theme => ({ width: { sm: '40%', xs: '100%' }, padding: '24px', height: 'fit-content' })}> */}
              {/* <ProjectDiscussions /> */}
              {/* <FlowProjectContributors /> */}
              {/* <FlowProjectWorkTracking /> */}
              {/* </Paper> */}
              <Paper
                elevation={2}
                sx={() => ({
                  width: { sm: "100%", xs: "100%" },
                  padding: "24px",
                  paddingTop: "8px",
                })}
              >
                {project?.roomId && (
                  <Room roomId={project.roomId}>
                    <ReactFlowProvider>
                      <Flow roomId={project.roomId} />
                      {/*<MiniMap />*/}
                    </ReactFlowProvider>
                  </Room>
                )}
              </Paper>
              <ShareFlowProjectModal
                open={activeModal === ProjectModalType.Share}
                onRequestClose={onCloseModal}
              />
              <RenameProjectModal
                open={activeModal === ProjectModalType.Rename}
                onRequestClose={closeRenameModal}
                project={project}
              />
              <PublishFlowProjectModal
                open={activeModal === ProjectModalType.Publish}
                onRequestClose={onCloseModal}
              />
              {/* <ProjectAddDiscussionModal
								open={activeModal === ProjectModalType.AddDiscussion}
								onRequestClose={onCloseModal}
							/> */}
            </Box>
          )}
        </BasePageLayout>
      </FlowProjectEditingContext.Provider>
    </FlowProjectContext.Provider>
  );
}
