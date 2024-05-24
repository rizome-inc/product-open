import { mergeSxStyles } from "@/util/misc";
import { Theme } from "@emotion/react";
import { deepmerge } from "@material-ui/utils";
import { SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";

export type DrawerModalProps = DrawerProps & {
  header?: React.ReactNode;
  headerActions?: React.ReactNode;
  subHeader?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function DrawerModal({
  children,
  header,
  headerActions,
  subHeader,
  sx,
  PaperProps,
  ...restProps
}: DrawerModalProps) {
  return (
    <Drawer
      {...restProps}
      PaperProps={deepmerge({ sx: mergeSxStyles({ width: "512px" }, sx) }, PaperProps)}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          padding: 3,
          paddingBottom: 1,
        }}
      >
        <Box maxWidth="75%" textOverflow="ellipsis">
          {header}
        </Box>
        <Stack direction={"row"} spacing={2}>
          {headerActions}
        </Stack>
      </Box>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          padding: 3,
          paddingTop: 0,
        }}
      >
        {subHeader}
      </Box>
      <Divider />
      <Box sx={{ padding: 3 }}>{children}</Box>
    </Drawer>
  );
}
