import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import * as React from "react";
import { BaseMenu } from "../BaseMenu";

export function MoreMenu({ children }: React.PropsWithChildren) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const onClose = (e: React.UIEvent) => {
    e.stopPropagation();
    setMenuAnchorEl(null);
  };

  const onMenuButtonClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  return (
    <>
      <IconButton color={"primary"} onClick={onMenuButtonClicked}>
        <MoreVertIcon />
      </IconButton>
      <BaseMenu
        anchorEl={menuAnchorEl}
        onClose={onClose}
        onClick={onClose}
        open={Boolean(menuAnchorEl)}
      >
        {children}
      </BaseMenu>
    </>
  );
}
