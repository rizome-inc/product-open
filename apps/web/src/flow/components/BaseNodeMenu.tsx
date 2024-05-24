import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import useLocalGraphBridgeStore from "../store/localGraphBridgeStore";

export function BaseNodeMenu() {
  const {
    menuAnchorElement,
    menuIsOpen,
    handleMenuClose,
    handleMenuDetailClick,
    handleMenuDeleteClick,
    nodeName,
  } = useLocalGraphBridgeStore();

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const onHandleDetailClick = () => {
    handleMenuDetailClick?.();
    handleMenuClose();
  };

  return (
    <>
      <Menu
        id="node-menu"
        anchorEl={menuAnchorElement}
        open={menuIsOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={onHandleDetailClick}>See details</MenuItem>
        {handleMenuDeleteClick ? (
          <MenuItem onClick={() => setOpenDeleteConfirmation(true)}>Delete</MenuItem>
        ) : (
          <MenuItem>
            <Typography sx={(theme) => ({ color: theme.palette.text.disabled })}>Delete</Typography>
          </MenuItem>
        )}
      </Menu>
      <ConfirmationModal
        title="Delete node?"
        message={`Are you sure you want to delete ${
          nodeName ? `the node ${nodeName}` : "this node"
        }?`}
        closeText="Keep node"
        confirmationCta="Delete node"
        onRequestClose={(didConfirm: boolean) => {
          if (didConfirm) {
            handleMenuDeleteClick?.();
          }
          handleMenuClose();
          setOpenDeleteConfirmation(false);
        }}
        open={openDeleteConfirmation}
      />
    </>
  );
}
