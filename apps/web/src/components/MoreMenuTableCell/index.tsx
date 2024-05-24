import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import TableCell, { TableCellProps } from "@mui/material/TableCell";
import * as React from "react";
import { BaseMenu } from "../BaseMenu";

export function MoreMenuTableCell({ children, ...restProps }: TableCellProps) {
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
    <TableCell variant="moreMenu" {...restProps}>
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
    </TableCell>
  );
}
