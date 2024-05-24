import { DrawerModal } from "@/components/DrawerModal";
import { InviteUsersModal } from "@/components/InviteUsersModal";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { useErrorModalContext } from "@/context/errorModals";
import { useProjectContext } from "@/context/project";
import { useToaster } from "@/context/useToaster";
import { useProjectContributors } from "@/hooks/useProjectContributors";
import { bucketContributors } from "@/util/misc";
import { isNotNull } from "@/util/typeGuards";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { ContributorRole, ContributorSchema, CreateContributorSchema, UserSchema } from "xylem";
import { ProjectContributorsByRole } from "../ProjectContributorsByRole";

type ShareProjectModalProps = {
  onRequestClose?: (changesMade?: boolean) => void;
  open?: boolean;
};

export function ShareProjectModal({ onRequestClose, open }: ShareProjectModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess } = useToaster();

  const { project } = useProjectContext();
  const {
    onContributorsChanged,
    sortedContributors,
    setSortedContributors,
    isUpdatingContributors,
    updateContributorsAsync,
  } = useProjectContributors({ project });

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

  const save = async () => {
    const allContributorRoles = Object.values(ContributorRole);
    if (project?.id && sortedContributors) {
      try {
        await updateContributorsAsync({
          id: project?.id,
          contributors: allContributorRoles
            .reduce<ContributorSchema[]>((res, role) => {
              const collection = sortedContributors[role]?.filter(isNotNull) || [];
              return res.concat(collection);
            }, [])
            .map<CreateContributorSchema>((x) => ({
              projectId: project.id!,
              userId: x.user!.id!,
              role: x.role,
            })),
        });

        toastSuccess("Contributors updated.");
        onRequestClose?.(false);
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
          Share Project
        </Typography>
      }
      headerActions={
        <>
          <Button
            id="shareProjectCancel"
            variant="outlined"
            onClick={onCancel}
            disabled={isUpdatingContributors}
          >
            <span>Cancel</span>
          </Button>
          <LoadingActionButton
            id="shareProjectFinish"
            loading={isUpdatingContributors}
            variant="contained"
            onClick={save}
          >
            <span>Save</span>
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <ProjectContributorsByRole
          contributors={sortedContributors?.Owner}
          description={["Can set other users' access", "Can also read, edit, and delete"]}
          onAddClicked={addEmptyContributorRow(ContributorRole.Owner)}
          onContributorsChanged={(contributors) =>
            onContributorsChanged(ContributorRole.Owner, contributors)
          }
          onRemoveClicked={removeContributorRow(ContributorRole.Owner)}
          onInviteUserClicked={onInviteUserClicked(ContributorRole.Owner)}
          project={project}
          role={ContributorRole.Owner}
        />
        <ProjectContributorsByRole
          contributors={sortedContributors?.Contributor}
          description={"Can read and edit"}
          onAddClicked={addEmptyContributorRow(ContributorRole.Contributor)}
          onContributorsChanged={(contributors) =>
            onContributorsChanged(ContributorRole.Contributor, contributors)
          }
          onRemoveClicked={removeContributorRow(ContributorRole.Contributor)}
          onInviteUserClicked={onInviteUserClicked(ContributorRole.Contributor)}
          project={project}
          role={ContributorRole.Contributor}
        />
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
          project={project}
          role={ContributorRole.Approver}
        />
        <ProjectContributorsByRole
          contributors={sortedContributors?.ReadOnly}
          onAddClicked={addEmptyContributorRow(ContributorRole.ReadOnly)}
          onContributorsChanged={(contributors) =>
            onContributorsChanged(ContributorRole.ReadOnly, contributors)
          }
          onRemoveClicked={removeContributorRow(ContributorRole.ReadOnly)}
          onInviteUserClicked={onInviteUserClicked(ContributorRole.ReadOnly)}
          project={project}
          role={ContributorRole.ReadOnly}
        />
        <InviteUsersModal
          open={Boolean(inviteUsersRole)}
          onRequestClose={onInviteUsersModalRequestClose}
        />
      </Stack>
    </DrawerModal>
  );
}
