import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import * as React from "react";
import { BaseMenu } from "../BaseMenu";

export type BasePageActionsMenuButtonProps = {
  title: string;
};

export function BasePageActionsMenuButton({
  children,
  title,
}: React.PropsWithChildren<BasePageActionsMenuButtonProps>) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const onClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="outlined" endIcon={<ArrowDropDownIcon />} onClick={onClick}>
        <span>{title}</span>
      </Button>
      <BaseMenu anchorEl={anchorEl} onClose={onClose} onClick={onClose} open={Boolean(anchorEl)}>
        {children}
      </BaseMenu>
    </>
  );
}
