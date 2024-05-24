import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/material/styles";
import * as React from "react";

export function KeyValue({
  children,
  label,
  sx,
}: React.PropsWithChildren<{ label: string; sx?: SxProps<Theme> }>) {
  return (
    <Stack direction="row" spacing={1} sx={sx}>
      <Typography variant="em">{label}:</Typography>
      {children}
    </Stack>
  );
}
