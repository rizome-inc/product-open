import List from "@mui/material/List";
import { styled } from "@mui/material/styles";

export const BulletList = styled(List)(({ theme }) => ({
  listStyleType: "disc",
  listStylePosition: "inside",
  "& .MuiListItem-root": {
    display: "list-item",
    border: "none",
    paddingLeft: theme.spacing(1),
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
  },
}));
