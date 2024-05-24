import { BulletList } from "@/components/BulletList";
import EmptyState from "@/components/EmptyState";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { FrownIcon } from "@/components/svgIcons/FrownIcon";
import { useErrorModalContext } from "@/context/errorModals";
import { useProjectContext } from "@/context/project";
import { useToaster } from "@/context/useToaster";
import { useProjectContributors } from "@/hooks/useProjectContributors";
import { getEntityDisplayName } from "@/util/misc";
import { isNotNull } from "@/util/typeGuards";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { ContributorRole, ProjectApprovalResponse, projectApprovalResponseSchema } from "xylem";
import { ProjectDenyApprovalModal } from "../ProjectDenyApprovalModal";

export function ProjectContributors() {
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess } = useToaster();
  const [showingDenyModal, setShowingDenyModal] = React.useState<boolean>(false);
  const { project } = useProjectContext();

  const {
    approvalsByUserId,
    canEdit,
    editContributorsClicked,
    isSubmittingAprroval,
    sortedContributors,
    submitApprovalAsync,
    user,
  } = useProjectContributors({ project });

  const approvers = sortedContributors ? sortedContributors[ContributorRole.Approver] : [];

  // console.log(approvers)

  const onApproveClicked = async () => {
    if (project?.id) {
      try {
        await submitApprovalAsync({
          id: project.id,
          approval: projectApprovalResponseSchema.parse({
            response: ProjectApprovalResponse.Approved,
          }),
        });
        toastSuccess("Project approved!");
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  const denyApprovalModalRequestClose = () => setShowingDenyModal(false);

  //if no contributors, show an empty state
  if (
    sortedContributors &&
    sortedContributors[ContributorRole.Contributor]?.length == 0 &&
    !project?.publishedAt
  ) {
    return (
      <Stack sx={{ mt: 2 }}>
        <Typography sx={{ mb: 1 }} variant="em">
          Contributors
        </Typography>
        <EmptyState
          title="No Contributors Added Yet"
          action="Add Contributors"
          actionId="shareProjectStart2"
          onClick={editContributorsClicked}
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={2} direction={"column"}>
      <div>
        <Box sx={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
          <Typography variant="em">Contributors</Typography>
          <Button
            id="shareProjectStart2"
            disabled={!canEdit}
            variant="text"
            onClick={editContributorsClicked}
          >
            Edit contributors
          </Button>
        </Box>
        <BulletList>
          {sortedContributors &&
            sortedContributors[ContributorRole.Contributor]
              ?.filter(isNotNull)
              .map((contributor) => {
                return (
                  <ListItem key={contributor.user?.id}>
                    {getEntityDisplayName(contributor.user)}
                  </ListItem>
                );
              })}
        </BulletList>
      </div>
      <div>
        {project?.publishedAt && (
          <Box sx={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
            <Typography variant="em">Approvers</Typography>
            {approvers?.filter(isNotNull).some((x) => x.user?.id === user?.id) && (
              <Stack direction="row" spacing={2}>
                <Button
                  id="approveProjectDenyStart"
                  variant="outlined"
                  disabled={isSubmittingAprroval}
                  onClick={() => setShowingDenyModal(true)}
                >
                  Deny
                </Button>
                <LoadingActionButton
                  id="approveProjectFinish1"
                  variant="outlined"
                  onClick={onApproveClicked}
                  loading={isSubmittingAprroval}
                >
                  Approve
                </LoadingActionButton>
              </Stack>
            )}
          </Box>
        )}
        {project?.publishedAt && (
          <List>
            {approvers?.filter(isNotNull).map((contributor) => {
              const approval = contributor.user?.id
                ? approvalsByUserId?.[contributor.user.id]
                : null;
              const isApproved = approval?.response === ProjectApprovalResponse.Approved;
              return (
                <ListItem
                  key={contributor.user?.id}
                  sx={{
                    color: ({ palette }) =>
                      approval
                        ? isApproved
                          ? palette.success.main
                          : palette.error.main
                        : undefined,
                    border: "none",
                    gap: 1,
                    pl: 1,
                    ":not(:first-of-type)": { mt: 0.5 },
                  }}
                >
                  {!approval ? (
                    <HorizontalRuleIcon />
                  ) : isApproved ? (
                    <SentimentSatisfiedAltIcon color="success" />
                  ) : (
                    <FrownIcon />
                  )}
                  {getEntityDisplayName(contributor.user)}
                </ListItem>
              );
            })}
          </List>
        )}
      </div>
      <ProjectDenyApprovalModal
        open={showingDenyModal}
        onRequestClose={denyApprovalModalRequestClose}
      />
    </Stack>
  );
}
