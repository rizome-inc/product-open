import { FormControl } from "@mui/material";
import { styled } from "@mui/material/styles";

export const MentionInputClassName = "rizome-mention-input";
export const MentionClassName = "rizome-mention";

const paddingTop = "6px";
const paddingBottom = "6px";
const padding = "6px 9px";
const minHeight = 52;

export const StyledFormControl = styled(FormControl)(({ theme, error }) => ({
  [`&`]: {
    ...theme.typography.body1,
    lineHeight: "1.2em",
  },
  "& fieldset": {
    border: `2px solid #777`,
  },
  [`& textarea`]: {
    background: "#fff",
    border: `2px solid #777`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    minHeight,
    padding,
    transition: theme.transitions.create("border-bottom-color", {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }),
    "&:focus": {
      outline: "none",
      border: !error && `2px solid ${theme.palette.primary.main}`,
    },
    "&:disabled": {
      color: theme.palette.text.disabled,
      border: `2px solid ${theme.palette.divider}`,
    },
    "&:hover:not(:disabled):not(:focus)": {
      border: `2px solid ${theme.palette.info.main}`,
    },
  },
  [`& .${MentionInputClassName}__highlighter`]: {
    boxSizing: "border-box",
    borderLeft: `2px solid transparent !important`,
    borderRight: `2px solid transparent !important`,
    minHeight,
    padding,
  },
  [`& .${MentionInputClassName}__suggestions`]: {
    marginTop: `calc(${paddingTop} + ${paddingBottom}) !important`,
    width: "max-content",
  },
  [`& .${MentionInputClassName}__suggestions__list`]: {
    maxHeight: 300,
    overflowY: "auto",
  },
  [`& .${MentionClassName}`]: {
    display: "inline",
    background: "#eee",
    borderRadius: "4px",
    padding: "2px 2px",
    margin: "-2px -2px",
    transition: theme.transitions.create("background-color", {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  [`& .${MentionInputClassName}__suggestions__item--focused`]: {
    backgroundColor: theme.palette.action.selected,
  },
}));
