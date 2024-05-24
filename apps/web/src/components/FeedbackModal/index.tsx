import { useErrorModalContext } from "@/context/errorModals";
import { useSendFeedbackMutation } from "@/queries/feedback";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { AddFeedbackSchema } from "xylem";
import { DrawerModal } from "../DrawerModal";
import { InputField } from "../InputField";
import { LoadingActionButton } from "../LoadingActionButton";

type FeedbackModalProps = {
  onRequestClose?: (feedbackSent?: boolean) => void;
  open?: boolean;
};

export function FeedbackModal({ onRequestClose, open }: FeedbackModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const [feedbackToSend, setFeedbackToSend] = React.useState<AddFeedbackSchema>({
    difficulty: "",
    reason: "",
  });

  const { isLoading: isSendingFeedback, mutateAsync: sendFeedbackAsync } =
    useSendFeedbackMutation();

  const onInputChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackToSend((val) => ({
      ...val,
      [e.target.name]: e.target.value,
    }));
  };

  const reset = () => {
    setFeedbackToSend({
      difficulty: "",
      reason: "",
    });
  };

  const onCancel = () => {
    reset();
    onRequestClose?.(false);
  };

  const send = async () => {
    try {
      await sendFeedbackAsync(feedbackToSend);
      reset();
      onRequestClose?.(true);
      // TODO: toast success
    } catch (error) {
      showErrorModal(error);
    }
  };

  return (
    <DrawerModal
      anchor="right"
      onClose={onCancel}
      open={open}
      header={
        <Typography noWrap={true} variant="h2">
          Give Feedback
        </Typography>
      }
      headerActions={
        <>
          <Button variant="outlined" onClick={onCancel}>
            <span>Cancel</span>
          </Button>
          <LoadingActionButton loading={isSendingFeedback} onClick={send} variant="contained">
            <span>Give Feedback</span>
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <Typography component={"p"}>
          {
            "We are grateful for your feedback, and sorry for whatever issue you've encountered. Thank you for helping make Rizome better! All fields are optional."
          }
        </Typography>
        <InputField
          id="feedback.reason"
          label="What are you trying to do?"
          minRows={2}
          multiline={true}
          name="reason"
          onChange={onInputChanged}
          value={feedbackToSend.reason}
        />
        <InputField
          id="feedback.difficulty"
          label="What’s difficult or problematic about it and why?"
          minRows={2}
          multiline={true}
          name="difficulty"
          onChange={onInputChanged}
          value={feedbackToSend.difficulty}
        />
        <InputField
          id="feedback.preference"
          label="What would you prefer?"
          minRows={2}
          multiline={true}
          name="preference"
          onChange={onInputChanged}
          value={feedbackToSend.preference}
        />
        <InputField
          id="feedback.suggestion"
          label="Anything else you'd like to say?"
          minRows={2}
          multiline={true}
          name="suggestion"
          onChange={onInputChanged}
          value={feedbackToSend.suggestion}
        />
      </Stack>
    </DrawerModal>
  );
}
