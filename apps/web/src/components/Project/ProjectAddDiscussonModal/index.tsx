import { DrawerModal } from "@/components/DrawerModal";
import { InputField } from "@/components/InputField";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { DicussionRequestedParticipants } from "@/components/discussion/DiscussionRequestedParticipants";
import { useErrorModalContext } from "@/context/errorModals";
import { useProjectContext } from "@/context/project";
import { useProjectContributors } from "@/hooks/useProjectContributors";
import { useCreateDiscussionMutation } from "@/queries";
import { isNotNull } from "@/util/typeGuards";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import * as React from "react";
import { CreateDiscussionSchema, UserSchema, createDiscussionSchema } from "xylem";

type ProjectAddDiscussionModalProps = {
  onRequestClose?: (changesMade?: boolean) => void;
  open?: boolean;
};

export function ProjectAddDiscussionModal({
  onRequestClose,
  open,
}: ProjectAddDiscussionModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const router = useRouter();

  const { project } = useProjectContext();
  const { sortedContributors } = useProjectContributors({ project });
  const { isLoading: isCreating, mutateAsync: createDiscussionAsync } =
    useCreateDiscussionMutation();

  const [discussionName, setDiscussionName] = React.useState<string>("");
  const [topic, setTopic] = React.useState<string>("");
  const getDefaultParticipants = () => {
    const contributors = sortedContributors?.Contributor?.filter(isNotNull).map((x) => x.user!);
    return contributors && contributors.length > 0 ? contributors : [null];
  };
  const [participants, setParticipants] =
    React.useState<(Partial<UserSchema> | null)[]>(getDefaultParticipants);

  const [filesToUpload, setFilesToUpload] = React.useState<File[] | undefined>(undefined);

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
    setDiscussionName("");
    setParticipants(getDefaultParticipants());
    setTopic("");
    onRequestClose?.(true);
  };

  const onCancel = () => {
    reset();
  };

  const create = async () => {
    if (project?.id) {
      const request: CreateDiscussionSchema = {
        name: discussionName,
        topic,
        projectId: project.id,
        // todo: this is irritating
        participantIds: participants
          ?.filter((p) => p !== null && p.id !== null && p.id !== undefined)
          .map((p) => p!.id!),
      };
      try {
        createDiscussionSchema.parse(request);
        const discussion = await createDiscussionAsync({
          body: request,
        });
        // todo: verify below is true
        // We can't conditionally invoke the discussion controller hook so we pass some URL params instead
        router.push(`/projects/${project.id}/discussion/${discussion.id}`);
        // todo: still necessary if we redirect?
        reset();
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  const disableInputs = isCreating;

  return (
    <DrawerModal
      anchor="right"
      onClose={onCancel}
      open={open}
      header={
        <Typography noWrap={true} variant="h2">
          Add Discussion
        </Typography>
      }
      headerActions={
        <>
          <Button
            id="createDiscussionCancel"
            variant="outlined"
            onClick={onCancel}
            disabled={disableInputs}
          >
            <span>Cancel</span>
          </Button>
          <LoadingActionButton
            id="createDiscussionFinish"
            variant="contained"
            onClick={create}
            loading={disableInputs}
          >
            <span>Add discussion</span>
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <Typography>
          Discussions enable you to collaborate, share feedback, and make decisions, with
          documentation of the process and the outcome
        </Typography>
        <div>
          <Grid spacing={2} direction="row" container={true}>
            <Grid item={true} xs={6}>
              <Stack direction={"column"} spacing={2}>
                <InputField
                  label="Discussion name"
                  disabled={disableInputs}
                  onChange={({ target }) => setDiscussionName(target.value || "")}
                  value={discussionName || ""}
                />
                <InputField
                  label="Topic"
                  disabled={disableInputs}
                  multiline={true}
                  minRows={2}
                  onChange={({ target }) => setTopic(target.value || "")}
                  value={topic || ""}
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
