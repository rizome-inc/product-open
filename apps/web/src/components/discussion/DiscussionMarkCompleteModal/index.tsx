import { DrawerModal } from "@/components/DrawerModal";
import { InputField } from "@/components/InputField";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { copyToClipboard } from "@/util/misc";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";

type DiscussionMarkCompleteModalProps = {
  onRequestClose?: (changesMade?: boolean) => void;
  open?: boolean;
};

export function DiscussionMarkCompleteModal({
  onRequestClose,
  open,
}: DiscussionMarkCompleteModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess } = useToaster();

  const { discussion } = useDiscussionContext();

  const { completeDiscussionMutation } = useDiscussionEditingContext();

  const [outcome, setOutcome] = React.useState<string>(() => discussion?.outcome ?? "");
  React.useEffect(() => {
    setOutcome(discussion?.outcome ?? "");
  }, [discussion]);

  const inputRef = React.useRef<HTMLInputElement>();

  const reset = () => {
    setOutcome("");
  };

  const onCancel = () => {
    reset();
    onRequestClose?.(false);
  };

  const markCompleteAsync = async () => {
    if (discussion?.id) {
      try {
        await completeDiscussionMutation.mutateAsync({
          id: discussion.id,
          request: {
            outcome,
          },
        });
        toastSuccess("Discussion completed.");
        onRequestClose?.(true);
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  const onCopyToClipboard = async () => {
    const inputEl = inputRef.current;
    if (inputEl) {
      inputEl.select();
      inputEl.setSelectionRange(0, 99999);
      const result = await copyToClipboard(inputEl.value);
      if (result) {
        toastSuccess("Copied to clipboard");
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
          Complete Discussion
        </Typography>
      }
      headerActions={
        <>
          <Button id="completeDiscussionCancel" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <LoadingActionButton
            id="completeDiscussionFinish"
            variant="contained"
            onClick={markCompleteAsync}
          >
            Complete
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <InputField
          label="Outcome"
          minRows={2}
          multiline={true}
          onChange={({ target }) => setOutcome(target.value || "")}
          value={outcome}
          inputRef={inputRef}
        />
        <Button variant="text" onClick={onCopyToClipboard} sx={{ alignSelf: "flex-start" }}>
          <ContentCopyIcon />
          <span>Copy to clipboard</span>
        </Button>
      </Stack>
    </DrawerModal>
  );
}
