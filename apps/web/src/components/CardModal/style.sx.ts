import { Theme } from "@emotion/react";
import { SxProps } from "@mui/material";

export const modalStyle: SxProps<Theme> = {
  bgcolor: "background.paper",
  borderRadius: "4px",
  boxShadow: 24,
  left: "50%",
  minWidth: 560,
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  outline: 0,
};

export const modalHeaderStyle: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  padding: 3,
  width: "100%",
};

export const modalBodyStyle: SxProps<Theme> = {
  padding: 3,
  width: "100%",
};

export const modalFooterStyle: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 3,
  width: "100%",
};
