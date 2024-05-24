import { Button } from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { DialogModal } from "../DialogModal";
import { CalloutMessage } from "../messages/CalloutMessage";
import { CalloutMessageStatus } from "../messages/CalloutMessage/types";

export type ConfirmationModalProps = {
  confirmationCta?: string;
  closeText?: string;
  message: React.ReactNode | string[];
  onRequestClose: (didConfirm: boolean) => void;
  open: boolean;
  title?: React.ReactNode;
  warningMessage?: React.ReactNode | string[];
};

const getMessageContent = (input: React.ReactNode | string[]) => {
  if (React.isValidElement(input)) {
    return input;
  }
  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return input;
  }
  if (Array.isArray(input) && input.every((x) => typeof x === "string")) {
    return input.map((x, i) => <Typography key={i}>{x}</Typography>);
  }
};

export function ConfirmationModal({
  confirmationCta,
  closeText,
  message,
  onRequestClose,
  open,
  title,
  warningMessage,
}: ConfirmationModalProps) {
  const close =
    (didConfirm = false) =>
    () => {
      onRequestClose(didConfirm);
    };
  return (
    <DialogModal
      open={open}
      title={title}
      onClose={close(false)}
      actions={
        <>
          <Button onClick={close(false)} variant="outlined">
            {closeText || "Cancel"}
          </Button>
          <Button color="warning" onClick={close(true)} variant="contained">
            <Typography color={"white"}>{confirmationCta || "Yes"}</Typography>
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <div>{getMessageContent(message)}</div>
        {warningMessage ? (
          <CalloutMessage status={CalloutMessageStatus.Warning}>
            {getMessageContent(warningMessage)}
          </CalloutMessage>
        ) : null}
      </Stack>
    </DialogModal>
  );
}
