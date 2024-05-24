import { CalloutMessageStatus } from "../messages/CalloutMessage/types";

declare module "notistack" {
  interface VariantOverrides {
    // specifies the "extra" props these variants takes in options of `enqueueSnackbar`
    error: {
      status: CalloutMessageStatus;
      sx: SxProps<Theme>;
      onCloseClicked?: () => void;
    };
    success: {
      status: CalloutMessageStatus;
      sx: SxProps<Theme>;
      onCloseClicked?: () => void;
    };
    warning: {
      status: CalloutMessageStatus;
      sx: SxProps<Theme>;
      onCloseClicked?: () => void;
    };
  }
}
