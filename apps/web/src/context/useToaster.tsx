import { CalloutMessageStatus } from "@/components/messages/CalloutMessage/types";
import { getStringValueForError } from "@/util/misc";
import { SxProps, Theme } from "@mui/material";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import * as React from "react";

const sx: SxProps<Theme> = {
  "& .MuiStack-root": {
    alignItems: "center",
  },
};

export function useToaster() {
  const toastError = React.useCallback((error: any) => {
    return enqueueSnackbar({
      variant: "error",
      status: CalloutMessageStatus.Error,
      message: getStringValueForError(error),
      sx,
    });
  }, []);

  const toastSuccess = React.useCallback((message: string) => {
    const key = enqueueSnackbar({
      variant: "success",
      status: CalloutMessageStatus.Success,
      message,
      onCloseClicked: () => {
        closeSnackbar(key);
      },
      sx,
    });

    return key;
  }, []);

  const toastWarning = React.useCallback((message: string | string[]) => {
    return enqueueSnackbar({
      variant: "warning",
      status: CalloutMessageStatus.Warning,
      message,
      sx,
    });
  }, []);

  return { toastError, toastSuccess, toastWarning } as const;
}
