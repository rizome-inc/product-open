import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";

export const Tag = styled(Chip)(({ theme }) => ({
  ...theme.typography.body1,
  backgroundColor: theme.palette.divider,
  borderRadius: `${theme.shape.borderRadius}px`,
  height: "auto",
  padding: "2px 7px",
  "& .MuiChip-deleteIcon": {
    margin: 0,
  },
  "& .MuiChip-label": {
    padding: 0,
  },
}));
