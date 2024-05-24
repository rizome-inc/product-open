import { useErrorModalContext } from "@/context/errorModals";
import { useSendSupportRequestMutation } from "@/queries";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { SupportSchema } from "xylem";
import { DrawerModal } from "../DrawerModal";
import { InputField } from "../InputField";
import { LoadingActionButton } from "../LoadingActionButton";

type SupportModalProps = {
  onRequestClose?: (supportRequestSent?: boolean) => void;
  open?: boolean;
};

export function SupportModal({ onRequestClose, open }: SupportModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const [supportRequest, setSupportRequest] = React.useState<SupportSchema>({
    help: "",
  });

  const { isLoading: isSendingFeedback, mutateAsync: sendSupportRequestAsync } =
    useSendSupportRequestMutation();

  const onInputChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSupportRequest({
      help: e.target.value,
    });
  };

  const reset = () => {
    setSupportRequest({
      help: "",
    });
  };

  const onCancel = () => {
    reset();
    onRequestClose?.(false);
  };

  const send = async () => {
    try {
      await sendSupportRequestAsync(supportRequest);
      reset();
      onRequestClose?.();
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
          Support Ticket
        </Typography>
      }
      headerActions={
        <>
          <Button variant="outlined" onClick={onCancel}>
            <span>Cancel</span>
          </Button>
          <LoadingActionButton loading={isSendingFeedback} onClick={send} variant="contained">
            <span>Submit Ticket</span>
          </LoadingActionButton>
        </>
      }
    >
      <Stack direction={"column"} spacing={2}>
        <Typography component={"p"}>
          {
            "We are here to help. Tell us what you're trying to do and we will get back to you as soon as we are able"
          }
        </Typography>
        <InputField
          id="support.help"
          label="How can we help?"
          minRows={2}
          multiline={true}
          name="help"
          onChange={onInputChanged}
          value={supportRequest.help}
        />
      </Stack>
    </DrawerModal>
  );
}
