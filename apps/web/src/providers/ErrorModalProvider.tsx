import { ErrorModalContext, useErrorModalContextController } from "@/context/errorModals";
import { ErrorModalData } from "@/types";
import { getStringValueForError } from "@/util/misc";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import React from "react";
import { DialogModal } from "../components/DialogModal";
import { CalloutMessage } from "../components/messages/CalloutMessage";
import {
  CalloutMessageSize,
  CalloutMessageStatus,
} from "../components/messages/CalloutMessage/types";

export const ErrorModalProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const context = useErrorModalContextController();

  const renderContent = (modal: ErrorModalData) => {
    if (React.isValidElement(modal.content)) {
      return modal.content;
    }

    const message = getStringValueForError(modal.content);

    if (Array.isArray(message)) {
      return (
        <Stack direction={"column"} spacing={1}>
          {message.map((x, i) => (
            <span key={`${modal.id}-${i}`}>{x}</span>
          ))}
        </Stack>
      );
    }
    return message;
  };

  return (
    <ErrorModalContext.Provider value={context}>
      {children}
      {context.errorModals.map((modal) => (
        <DialogModal
          key={modal.id}
          open={true}
          title={modal.title || "Error"}
          onClose={() => context.onClose(modal.id)}
          actions={
            <Button onClick={() => context.onClose(modal.id)} variant="outlined">
              Close
            </Button>
          }
        >
          <CalloutMessage
            shadow={false}
            size={CalloutMessageSize.Regular}
            status={CalloutMessageStatus.Error}
            sx={{ width: "100%" }}
          >
            {renderContent(modal)}
          </CalloutMessage>
        </DialogModal>
      ))}
    </ErrorModalContext.Provider>
  );
};
