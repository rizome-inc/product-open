import { DrawerModal } from "@/components/DrawerModal";
import { InputField } from "@/components/InputField";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { DicussionRequestedParticipants } from "@/components/discussion/DiscussionRequestedParticipants";
import { useErrorModalContext } from "@/context/errorModals";
import { useProjectContext } from "@/context/project";
import { useToaster } from "@/context/useToaster";
import { useProjectContributors } from "@/hooks/useProjectContributors";
import { useUserSessionContext } from "@/hooks/userSession";
import { useAddProjectApprovalMutation } from "@/queries";
import { getEntityDisplayName } from "@/util/misc";
import { isNotNull } from "@/util/typeGuards";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { ProjectApprovalResponse, ProjectApprovalResponseSchema, UserSchema } from "xylem";

type DenyApprovalModalProps = {
  onRequestClose?: (changesMade?: boolean) => void;
  open?: boolean;
};

export function ProjectDenyApprovalModal({ onRequestClose, open }: DenyApprovalModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess } = useToaster();
  const { user } = useUserSessionContext();

  const { project, refetchDiscussionsData } = useProjectContext();
  const { sortedContributors } = useProjectContributors({ project });
  const { isLoading: isSubmittingAprroval, mutateAsync: submitApprovalAsync } =
    useAddProjectApprovalMutation();

  const [discussionName, setDiscussionName] = React.useState<string>(
    `Reason for denial: ${getEntityDisplayName(user)}`,
  );
  const [rejectionReason, setRejectionReason] = React.useState<string>("");
  const getDefaultParticipants = () => {
    const contributors = sortedContributors?.Contributor?.filter(isNotNull).map((x) => x.user!);
    return contributors && contributors.length > 0 ? contributors : [null];
  };
  const [participants, setParticipants] =
    React.useState<(Partial<UserSchema> | null)[]>(getDefaultParticipants);

  const onAddParticipantClicked = () => {
    setParticipants((v) => [...v, null]);
  };

  const onRemoveParticipantClicked = (_: Partial<UserSchema> | null, index: number) =>
    setParticipants((v) => {
      const res = [...v];
      res.splice(index, 1);
      return res;
    });

  const onParticipantsChanged = (users: (Partial<UserSchema> | null)[]) => setParticipants(users);

  const reset = () => {
    setDiscussionName(`Reason for denial: ${getEntityDisplayName(user)}`);
    setParticipants(getDefaultParticipants());
    setRejectionReason("");
  };

  const onCancel = () => {
    reset();
    onRequestClose?.(false);
  };

  const deny = async () => {
    if (project?.id) {
      const approval: ProjectApprovalResponseSchema = {
        discussionName,
        response: ProjectApprovalResponse.Rejected,
        rejectionReason,
        // todo: this is irritating. also duplicated in ProjectAddDiscussionModal
        participantIds: participants
          ?.filter((p) => p !== null && p.id !== null && p.id !== undefined)
          .map((p) => p!.id!),
      };
      try {
        await submitApprovalAsync({
          id: project.id,
          approval,
        });
        toastSuccess("Project approval denied");
        onRequestClose?.(true);
        refetchDiscussionsData();
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
          Deny
        </Typography>
      }
      headerActions={
        <>
          <Button id="approveProjectDenyCancel" variant="outlined" onClick={onCancel}>
            <span>Cancel</span>
          </Button>
          <LoadingActionButton id="approveProjectFinish2" variant="contained" onClick={deny}>
            <span>Deny and Create Discussion</span>
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <Typography>
          To deny, you must explain your reason and the changes you are requesting
        </Typography>
        <div>
          <Grid spacing={2} direction="row" container={true}>
            <Grid item={true} xs={6}>
              <Stack direction={"column"} spacing={2}>
                <InputField
                  label="Discussion name"
                  onChange={({ target }) => setDiscussionName(target.value || "")}
                  value={discussionName || ""}
                />
                <InputField
                  label="Reason and changes requested"
                  multiline={true}
                  minRows={2}
                  onChange={({ target }) => setRejectionReason(target.value || "")}
                  value={rejectionReason || ""}
                />
              </Stack>
            </Grid>
          </Grid>
        </div>
        <DicussionRequestedParticipants
          description={
            "Anyone who edits, comments, or is tagged will be added to the participants list automatically"
          }
          onAddClicked={onAddParticipantClicked}
          onRemoveClicked={onRemoveParticipantClicked}
          onUsersChanged={onParticipantsChanged}
          users={participants}
        />
      </Stack>
    </DrawerModal>
  );
}
