import { CustomFormFieldProps } from "@/types/forms";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { FormFieldSelectSchema } from "xylem";
import { ReadOnlyText } from "../ReadOnlyText";

type CustomFormSelectProps = CustomFormFieldProps<string> & {};

export const CustomFormSelect = ({
  formField,
  onValueChanged,
  isEditing,
  getValue,
}: CustomFormSelectProps) => {
  const [localValue, setLocalValue] = React.useState<string>(getValue() || "");

  const onOptionSelected = (e: SelectChangeEvent) => {
    const {
      target: { value: inputValue },
    } = e;
    setLocalValue(inputValue);
    onValueChanged(inputValue);
  };

  // fixme: there's something off with the typing here. can we type narrow the union?
  const fieldProperties = (formField as Omit<FormFieldSelectSchema, "value"> & { value: string })
    .properties;
  return isEditing ? (
    <Select
      onChange={onOptionSelected}
      sx={{
        alignSelf: "flex-start",
        width: "100%",
        "& fieldset": (theme) => ({ borderWidth: "2px", borderColor: "#777" }),
      }}
      value={localValue}
    >
      <MenuItem value="">
        <Typography>None</Typography>
      </MenuItem>
      {fieldProperties?.options?.map((option, i) => {
        return (
          <MenuItem key={`option-${i}`} value={option.value}>
            {option.label}
          </MenuItem>
        );
      })}
    </Select>
  ) : (
    <ReadOnlyText value={localValue} />
  );
};
