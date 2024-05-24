import styled from "@emotion/styled";
import Button from "@mui/material/Button";
import { LoadingActionButton } from "../LoadingActionButton";

export const BasePageActionButton = styled(Button)(({ variant }) => ({
  ...((variant === "outlined" || variant === "contained") && {
    padding: 6,
  }),
}));

export const BasePageLoadingActionButton = styled(LoadingActionButton)(({ variant }) => ({
  ...((variant === "outlined" || variant === "contained") && {
    padding: 6,
  }),
}));
