import { mergeSxStyles } from "@/util/misc";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Tooltip,
  TooltipProps,
  Typography,
} from "@mui/material";
import { SnackbarContent } from "notistack";
import * as React from "react";
import { useCalloutMessage, useCalloutMessageColors } from "./hooks";
import { CalloutMessageSize, CalloutMessageStatus } from "./types";

export type CalloutMessageProps<
  T extends object = Theme,
  TElement = any,
> = React.PropsWithChildren<{
  onCloseClicked?: () => void;
  shadow?: boolean;
  size?: CalloutMessageSize;
  status: CalloutMessageStatus;
  sx?: SxProps<T>;
  message?: string;
  children?: React.ReactNode;
}> &
  React.RefAttributes<TElement>;

export const CalloutMessage = React.forwardRef<HTMLDivElement, CalloutMessageProps>(
  function CalloutMessage(
    { message, children, onCloseClicked, shadow, size = CalloutMessageSize.Regular, status, sx },
    ref,
  ) {
    const { baseSxStyle, icon } = useCalloutMessage(size, status, shadow);
    return (
      <SnackbarContent ref={ref}>
        <Box sx={mergeSxStyles(baseSxStyle, sx)}>
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {icon}
            {message ? <Typography>{message}</Typography> : children ? children : null}

            {onCloseClicked && (
              <IconButton
                aria-label="close"
                color={"primary"}
                onClick={onCloseClicked}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Stack>
        </Box>
      </SnackbarContent>
    );
  },
);

export type CalloutMessageTooltipProps<T extends object = Theme> = Pick<
  TooltipProps,
  "placement" | "title" | "open" | "onOpen" | "children"
> &
  CalloutMessageProps<T>;

export function CalloutMessageTooltip({
  children,
  open,
  placement,
  title,
  status,
  ...restProps
}: CalloutMessageTooltipProps) {
  const { backgroundColor, color } = useCalloutMessageColors(status);

  return (
    <Tooltip
      arrow={true}
      componentsProps={{
        arrow: {
          sx: {
            color: placement?.includes("right") ? color : backgroundColor,
          },
        },
        tooltip: { sx: { padding: 0 } },
      }}
      open={open}
      placement={placement}
      title={
        <CalloutMessage status={status} {...restProps}>
          {title}
        </CalloutMessage>
      }
    >
      {children}
    </Tooltip>
  );
}
