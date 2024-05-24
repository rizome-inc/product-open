import Radio, { RadioProps } from "@mui/material/Radio";
import { styled } from "@mui/material/styles";

export const BaseRadio = styled((props: RadioProps) => <Radio {...props} />)(({ theme }) => ({
  "&.Mui-checked": {
    color: theme.palette.text.secondary,
    "& .MuiSvgIcon-root:not(:first-of-type)": {
      color: theme.palette.highlight?.main,
    },
  },
}));
