import { Close } from "@mui/icons-material";
import { Divider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import React from "react";
import { modalBodyStyle, modalFooterStyle, modalHeaderStyle, modalStyle } from "./style.sx";

export type CardModalProps = {
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  onRequestClose?: () => void;
  open?: boolean;
};

function CardModal({
  children,
  footer,
  header,
  onRequestClose,
  open = false,
}: React.PropsWithChildren<CardModalProps>) {
  return (
    <Modal open={open} onClose={onRequestClose}>
      <Box sx={modalStyle}>
        <Box sx={modalHeaderStyle}>
          <Typography variant="h2">{header}</Typography>
          {onRequestClose ? (
            <Button onClick={onRequestClose}>
              <Close />
            </Button>
          ) : null}
        </Box>
        <Divider />
        <Box sx={modalBodyStyle}>{children}</Box>
        <Divider />
        <Box sx={modalFooterStyle}>{footer}</Box>
      </Box>
    </Modal>
  );
}

export default CardModal;
