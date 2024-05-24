import { AddButton } from "@/components/AddButton";
import { DrawerModal } from "@/components/DrawerModal";
import { InviteUsersModal } from "@/components/InviteUsersModal";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { UserSelect } from "@/components/UserSelect";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { useUserSessionContext } from "@/hooks/userSession";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { UserSchema } from "xylem";

type DiscussionEditParticipantsModalProps = {
  onRequestClose?: (changesMade?: boolean) => void;
  open?: boolean;
};

export function DiscussionEditParticipantsModal({
  onRequestClose,
  open,
}: DiscussionEditParticipantsModalProps) {
  const { isAdmin } = useUserSessionContext();
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess, toastError } = useToaster();

  const { discussion, participants: discussionParticipants } = useDiscussionContext();
  const { updateParticipantsMutation } = useDiscussionEditingContext();

  const [showingInviteUsersModalForIndex, setShowingInviteUsersModalForIndex] =
    React.useState<number>(-1);
  const [participants, setParticipants] = React.useState<(Partial<UserSchema> | null)[]>(
    discussionParticipants || [null],
  );
  React.useEffect(() => {
    if (discussionParticipants) {
      setParticipants(discussionParticipants);
    }
  }, [discussionParticipants]);

  const reset = () => {
    setParticipants(discussionParticipants || [null]);
  };

  const onCancel = () => {
    reset();
    onRequestClose?.(false);
  };

  const save = async () => {
    if (discussion?.id) {
      try {
        await updateParticipantsMutation.mutateAsync({
          id: discussion.id,
          participantIds: participants.filter(Boolean).map((x) => x?.id!),
        });
        toastSuccess("Participants updated.");
        onRequestClose?.(true);
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  const onAddClicked = () => setParticipants((v) => [...v, null]);
  const onRemoveClicked = (_: Partial<UserSchema> | null | undefined, i: number) => () => {
    const next = participants.slice();
    next.splice(i, 1);
    setParticipants(next);
  };

  const onSelectionChanged =
    (user: Partial<UserSchema> | null | undefined, i: number) =>
    (value: Partial<UserSchema> | null) => {
      if (participants) {
        if (user?.id === value?.id) {
          return;
        }
        const index = !user ? -1 : participants.findIndex((x) => x?.id === value?.id);
        if (index === -1) {
          const updatedParticipants = participants.slice();
          updatedParticipants.splice(i, 1, !value ? null : value);

          setParticipants(updatedParticipants);
        } else {
          toastError("User cannot be selected twice");
        }
      }
    };

  const onInviteUsersModalRequestClose = async (usersInvited?: UserSchema[]) => {
    if (usersInvited?.length && showingInviteUsersModalForIndex > -1) {
      onSelectionChanged(
        participants[showingInviteUsersModalForIndex],
        showingInviteUsersModalForIndex,
      )(usersInvited[0]);
    }
    setShowingInviteUsersModalForIndex(-1);
  };

  return (
    <DrawerModal
      anchor="right"
      onClose={onCancel}
      open={open}
      header={
        <Typography noWrap={true} variant="h2">
          Edit Participants
        </Typography>
      }
      headerActions={
        <>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <LoadingActionButton variant="contained" onClick={save}>
            Save
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <Grid spacing={2} direction="row" container={true}>
          <Grid item={true} xs={6}>
            <Stack spacing={1} direction="column">
              {participants?.map((participant, i) => {
                const isCreator = discussion?.creatorId === participant?.id;
                return (
                  <Stack key={i} spacing={1} direction="row">
                    <UserSelect
                      disabled={isCreator}
                      onInviteUserClicked={() => setShowingInviteUsersModalForIndex(i)}
                      onSelectionChanged={onSelectionChanged(participant, i)}
                      selectedUser={participant || null}
                      sx={{ width: "100%" }}
                    />
                    {isAdmin || isCreator ? (
                      <IconButton
                        onClick={onRemoveClicked(participant, i)}
                        disabled={isCreator}
                        sx={{ opacity: isCreator ? 0 : undefined }}
                      >
                        <CloseIcon color={"warning"} />
                      </IconButton>
                    ) : null}
                  </Stack>
                );
              })}
              <AddButton sx={{ alignSelf: "flex-start" }} onClick={onAddClicked} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <InviteUsersModal
        open={showingInviteUsersModalForIndex > -1}
        onRequestClose={onInviteUsersModalRequestClose}
      />
    </DrawerModal>
  );
}
