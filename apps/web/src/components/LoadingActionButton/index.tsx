import { mergeSxStyles } from "@/util/misc";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoadingButton, { LoadingButtonTypeMap } from "@mui/lab/LoadingButton";
import { SxProps, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import * as React from "react";

function LoadingActionButtonBase(
  props: React.PropsWithChildren<
    LoadingButtonTypeMap<any, React.ElementType> & { loading?: boolean; sx?: SxProps }
  >,
) {
  return (
    <LoadingButton
      sx={mergeSxStyles(
        {
          "& .MuiLoadingButton-loadingIndicator": {
            position: "static",
            transform: "none",
          },
        },
        props.sx,
      )}
      loadingIndicator={
        <Stack direction={"row"} spacing={1}>
          <AccessTimeIcon />
          <Typography component={"span"} noWrap={true}>
            In progress...
          </Typography>
        </Stack>
      }
      {...props}
    >
      {props.loading ? null : props.children}
    </LoadingButton>
  );
}

export const LoadingActionButton = LoadingActionButtonBase as typeof LoadingButton;
