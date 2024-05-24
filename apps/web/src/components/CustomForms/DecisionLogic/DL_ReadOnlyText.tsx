import { mergeSxStyles } from "@/util/misc";
import { SxProps, Theme } from "@mui/material";
import { ReadOnlyText } from "../ReadOnlyText";

// dev note: this is a different component because DL is irregular compared to other template-generated form elements
export const DL_ReadOnlyText = ({ value, sx }: { value?: string; sx?: SxProps<Theme> }) => (
  <ReadOnlyText sx={mergeSxStyles({ mb: 1 }, sx)} value={value} />
);
