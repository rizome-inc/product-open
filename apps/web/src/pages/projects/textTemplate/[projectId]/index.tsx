import { BasePageActionButton } from "@/components/BasePageActionButton";
import { BasePageActionsMenuButton } from "@/components/BasePageActionsMenuButton";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProjectAddDiscussionModal } from "@/components/Project/ProjectAddDiscussonModal";
import { ProjectContentCategories } from "@/components/Project/ProjectContentCategories";
import { ProjectContributors } from "@/components/Project/ProjectContributors";
import { ProjectDiscussions } from "@/components/Project/ProjectDiscussions";
import { ProjectWorkTracking } from "@/components/Project/ProjectWorkTracking";
import { PublishProjectModal } from "@/components/Project/PublishProjectModal";
import { RenameProjectModal } from "@/components/Project/RenameProjectModal";
import { ShareProjectModal } from "@/components/Project/ShareProjectModal";
import { useErrorModalContext } from "@/context/errorModals";
import {
  ProjectContext,
  ProjectEditingContext,
  ProjectModalType,
  useProjectContextController,
  useProjectEditingContextController,
} from "@/context/project";
import { useUserSessionContext } from "@/hooks/userSession";
import { BasePageLayout } from "@/layouts/BasePageLayout";
import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import React from "react";
import { ContributorRole, workTrackingSchema } from "xylem";

function Project() {
  const { user, isAdmin } = useUserSessionContext();
  const { showErrorModal } = useErrorModalContext();

  const router = useRouter();

  const projectId = parseInt(router.query.projectId as string, 10);

  const context = useProjectContextController({
    id: projectId,
  });
  const { isLoading, project, activeModal, setActiveModal } = context;

  const editingContext = useProjectEditingContextController(project);

  const isContributor =
    isAdmin ||
    project?.contributors?.some(
      (x) =>
        x.user?.id === user?.id &&
        (x.role === ContributorRole.Contributor || x.role === ContributorRole.Owner),
    );

  React.useEffect(() => {
    if (isContributor && router.query.edit === "true") {
      editingContext.setIsEditing(true);
      // remove query
      router.replace(router.asPath.split("?")[0], undefined, { shallow: true });
    }
  }, [isContributor, editingContext, router.query, router]);

  const onCloseModal = () => {
    setActiveModal(ProjectModalType.Unset);
  };

  const onSaveContent = async () => {
    try {
      workTrackingSchema.parse(editingContext.workTracking);
      editingContext.setIsSaving(true);
      await editingContext.updateProjectContentAsync();
      editingContext.setIsSaving(false); // because above is a callback
      editingContext.setIsEditing(false);
    } catch (error) {
      showErrorModal(error);
    }
  };

  return (
    <ProjectContext.Provider value={context}>
      <ProjectEditingContext.Provider value={editingContext}>
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
                    Cancel
                  </BasePageActionButton>
                  <LoadingActionButton
                    id="editProjectFinish"
                    onClick={onSaveContent}
                    disabled={editingContext.isUpdatingProjectContent}
                    variant="contained"
                    loading={editingContext.isSaving}
                  >
                    Save
                  </LoadingActionButton>
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
                  {project.publishedAt ? null : (
                    <MenuItem
                      id="publishProjectStart"
                      onClick={() => setActiveModal(ProjectModalType.Publish)}
                    >
                      {"Publish"}
                    </MenuItem>
                  )}
                </BasePageActionsMenuButton>
              )
            ) : undefined
          }
          hideDefaultActions={editingContext.isEditing}
          onRenderBreadcrumbPathComponent={(_pathComp, index, pathComps) => {
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
              <Paper
                elevation={2}
                sx={() => ({
                  width: { sm: "40%", xs: "100%" },
                  padding: "24px",
                  height: "fit-content",
                })}
              >
                <ProjectDiscussions />
                <ProjectContributors />
                <ProjectWorkTracking />
              </Paper>
              <Paper
                elevation={2}
                sx={() => ({
                  width: { sm: "60%", xs: "100%" },
                  padding: "24px",
                  paddingTop: "8px",
                })}
              >
                <ProjectContentCategories />
              </Paper>
              <ShareProjectModal
                open={activeModal === ProjectModalType.Share}
                onRequestClose={onCloseModal}
              />
              <RenameProjectModal
                open={activeModal === ProjectModalType.Rename}
                onRequestClose={onCloseModal}
                project={project}
              />
              <PublishProjectModal
                open={activeModal === ProjectModalType.Publish}
                onRequestClose={onCloseModal}
              />
              <ProjectAddDiscussionModal
                open={activeModal === ProjectModalType.AddDiscussion}
                onRequestClose={onCloseModal}
              />
            </Box>
          )}
        </BasePageLayout>
      </ProjectEditingContext.Provider>
    </ProjectContext.Provider>
  );
}

export default Project;
