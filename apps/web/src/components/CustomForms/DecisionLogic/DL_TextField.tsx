import { mergeSxStyles } from "@/util/misc";
import { TextField, TextFieldProps } from "@mui/material";

export const DL_TextField = (props: TextFieldProps) => {
  const { sx } = props;
  return (
    <TextField
      variant="outlined"
      {...props}
      sx={mergeSxStyles(
        {
          width: "100%",
          "&:hover": {
            borderColor: (theme) => theme.palette.text.primary,
          },
        },
        sx,
      )}
    />
  );
};
