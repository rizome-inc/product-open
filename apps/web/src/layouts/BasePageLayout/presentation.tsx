import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { SvgIcon } from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import * as React from "react";
import { BaseMenu } from "../../components/BaseMenu";
import { FeedbackModal } from "../../components/FeedbackModal";
import { SupportModal } from "../../components/SupportModal";

export function StuckActionButton() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openModalType, setOpenModalType] = React.useState<"feedback" | "support" | null>(null);

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const onClose = () => {
    setAnchorEl(null);
  };

  const showDrawerModal = (type: "feedback" | "support") => () => {
    onClose();
    setOpenModalType(type);
  };

  const onCloseModal = () => {
    setOpenModalType(null);
  };
  return (
    <>
      <Button variant="text" endIcon={<ArrowDropDownIcon />} onClick={onClick}>
        <span>Stuck?</span>
      </Button>
      <BaseMenu anchorEl={anchorEl} onClose={onClose} open={Boolean(anchorEl)}>
        <MenuItem onClick={showDrawerModal("feedback")}>Give Product Feedback</MenuItem>
        <Link href="https://docs.rizo.me" passHref={true} target="_blank">
          <MenuItem onClick={onClose}>
            <SvgIcon
              component={OpenInNew}
              style={{ fontSize: "1.2rem", marginRight: "-2px", marginLeft: "-1px" }}
            />
            Go to Docs
          </MenuItem>
        </Link>
        <MenuItem onClick={showDrawerModal("support")}>Submit a Support Ticket</MenuItem>
      </BaseMenu>
      <FeedbackModal open={openModalType === "feedback"} onRequestClose={onCloseModal} />
      <SupportModal open={openModalType === "support"} onRequestClose={onCloseModal} />
    </>
  );
}
