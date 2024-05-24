import HelpIcon from "@mui/icons-material/Help";
import { Box, Tooltip as MuiTooltip, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

export const Tooltip = ({ description, sx }: { description: string; sx?: SxProps<Theme> }) => {
  return (
    <Box sx={sx}>
      <MuiTooltip title={<Typography>{description}</Typography>} arrow={true}>
        <HelpIcon sx={{ height: "16px", width: "auto" }} />
      </MuiTooltip>
    </Box>
  );
};
