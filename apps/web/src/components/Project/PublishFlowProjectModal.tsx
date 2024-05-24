import { DrawerModal } from "@/components/DrawerModal";
import { InviteUsersModal } from "@/components/InviteUsersModal";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { useErrorModalContext } from "@/context/errorModals";
import { useFlowProjectContext } from "@/context/flowProject";
import { useToaster } from "@/context/useToaster";
import { useFlowProjectContributors } from "@/hooks/useFlowProjectContributors";
import { usePublishProjectMutation } from "@/queries";
import { bucketContributors } from "@/util/misc";
import { isNotNull } from "@/util/typeGuards";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { ContributorRole, ContributorSchema, CreateContributorSchema, UserSchema } from "xylem";
import { ProjectContributorsByRole } from "./ProjectContributorsByRole";

type PublishProjectModalProps = {
  onRequestClose?: (changesMade?: boolean) => void;
  open?: boolean;
};

export function PublishFlowProjectModal({ onRequestClose, open }: PublishProjectModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess } = useToaster();

  const { project } = useFlowProjectContext();
  const {
    onContributorsChanged,
    sortedContributors,
    setSortedContributors,
    isUpdatingContributors,
    updateContributorsAsync,
  } = useFlowProjectContributors({ project });

  // console.log(sortedContributors)

  const { isLoading: isPublishing, mutateAsync: publishProjectAsync } = usePublishProjectMutation();

  const [inviteUsersRole, setInviteUsersRole] = React.useState<ContributorRole | null>(null);

  const reset = () => {
    setSortedContributors(bucketContributors(project?.contributors));
  };

  const onCancel = () => {
    reset();
    onRequestClose?.(false);
  };

  const addEmptyContributorRow = (role: ContributorRole) => () => {
    if (sortedContributors) {
      const contributors = sortedContributors[role]?.slice();
      if (contributors) {
        contributors.push(null);
        setSortedContributors((v) => ({
          ...v!,
          [role]: contributors,
        }));
      }
    }
  };

  const removeContributorRow =
    (role: ContributorRole) => (_: ContributorSchema | null, index: number) => {
      if (sortedContributors) {
        const contributors = sortedContributors[role]?.slice();
        if (contributors) {
          contributors.splice(index, 1);
          setSortedContributors((v) => ({
            ...v!,
            [role]: contributors,
          }));
        }
      }
    };

  const onInviteUserClicked = (role: ContributorRole) => () => {
    setInviteUsersRole(role);
  };

  // TODO: consider putting this stuff in the contributor context
  // todo: this is duplicated in ShareProjectModal
  const onInviteUsersModalRequestClose = async (usersInvited: UserSchema[] = []) => {
    if (usersInvited && inviteUsersRole && project?.id && sortedContributors) {
      // todo: need a check for user ids being defined
      const contributors: ContributorSchema[] = (
        sortedContributors[inviteUsersRole].filter(isNotNull) || []
      )
        .concat(
          usersInvited.map((x) => ({
            projectId: project.id!,
            userId: x.id!,
            user: x,
            role: inviteUsersRole,
          })),
        )
        .filter(Boolean);
      onContributorsChanged(inviteUsersRole, contributors);
    }
    setInviteUsersRole(null);
  };

  // todo: this is mostly duplicated in ShareProjectModal
  const publish = async () => {
    const allContributorRoles = Object.values(ContributorRole);
    if (project?.id && sortedContributors) {
      try {
        if (sortedContributors[ContributorRole.Approver]?.length) {
          await updateContributorsAsync({
            id: project.id,
            contributors: allContributorRoles
              .reduce<ContributorSchema[]>((res, role) => {
                const collection = sortedContributors[role]?.filter(isNotNull) || [];
                return res.concat(collection);
              }, new Array<ContributorSchema>())
              .map<CreateContributorSchema>((x) => ({
                projectId: project.id!,
                userId: x.user!.id!,
                role: x.role,
              })),
          });
        }
        await publishProjectAsync(project.id);
        toastSuccess("Project published.");
        onRequestClose?.(true);
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  return (
    <DrawerModal
      anchor="right"
      onClose={onCancel}
      open={open}
      header={
        <Typography noWrap={true} variant="h2">
          Publish
        </Typography>
      }
      headerActions={
        <>
          <Button
            id="publishProjectCancel"
            variant="outlined"
            onClick={onCancel}
            disabled={isUpdatingContributors}
          >
            <span>Cancel</span>
          </Button>
          <LoadingActionButton
            id="publishProjectFinish"
            loading={isUpdatingContributors}
            variant="contained"
            onClick={publish}
          >
            <span>Publish</span>
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <Typography>Publishing the project will request review from all approvers</Typography>
        <ProjectContributorsByRole
          contributors={sortedContributors?.Approver}
          description={[
            "Can read and sign off",
            "If added, approval is required",
            "from each before the project",
            "can be published.",
          ]}
          onAddClicked={addEmptyContributorRow(ContributorRole.Approver)}
          onContributorsChanged={(contributors) =>
            onContributorsChanged(ContributorRole.Approver, contributors)
          }
          onRemoveClicked={removeContributorRow(ContributorRole.Approver)}
          onInviteUserClicked={onInviteUserClicked(ContributorRole.Approver)}
          role={ContributorRole.Approver}
          project={project}
        />
        <InviteUsersModal
          open={Boolean(inviteUsersRole)}
          onRequestClose={onInviteUsersModalRequestClose}
        />
      </Stack>
    </DrawerModal>
  );
}
