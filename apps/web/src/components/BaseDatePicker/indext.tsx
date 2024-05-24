import { mergeSxStyles } from "@/util/misc";
import { DatePickerProps } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Moment } from "moment";

export function BaseDatePicker({ sx, ...restProps }: DatePickerProps<Moment>) {
  return (
    <DatePicker
      {...restProps}
      sx={mergeSxStyles(
        (theme) => ({
          "& .MuiInputBase-input": {
            padding: "6px 9px",
          },
          "& fieldset": {
            borderWidth: 2,
            borderColor: "#777",
          },
        }),
        sx,
      )}
    />
  );
}
