import Box from "@mui/material/Box";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { CalloutMessageTooltip } from "../messages/CalloutMessage";
import { CalloutMessageStatus } from "../messages/CalloutMessage/types";

export type InputFieldProps = Omit<TextFieldProps, "error"> & {
  id?: string;
  error?: string | boolean | undefined;
  warning?: string | boolean;
};

/** @param ref Points to the internal Mui TextField component */
export const InputField = React.forwardRef<HTMLDivElement, InputFieldProps>(function InputField(
  { error, id, label, warning, ...restProps }: InputFieldProps,
  ref,
) {
  // const [localValue, setLocalValue] = React.useState<string | undefined>(value ? value as string : undefined);

  // const onChangeValue = (val: string) => {
  //   setLocalValue(val);
  //   onChange?.(val);
  // }

  const calloutMessage =
    typeof error === "string" ? error : typeof warning === "string" ? warning : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {label ? (
        <Typography component={"label"} htmlFor={id} variant="em">
          {label}
        </Typography>
      ) : null}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <CalloutMessageTooltip
          title={calloutMessage}
          open={Boolean(calloutMessage)}
          status={error ? CalloutMessageStatus.Error : CalloutMessageStatus.Warning}
        >
          <TextField
            error={typeof error === "boolean" ?? undefined}
            id={id}
            ref={ref}
            variant="outlined"
            {...restProps}
          />
        </CalloutMessageTooltip>
      </Box>
    </Box>
  );
});
