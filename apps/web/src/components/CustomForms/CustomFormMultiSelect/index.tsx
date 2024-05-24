import { Tag } from "@/components/Tag";
import { CustomFormFieldProps } from "@/types/forms";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import * as React from "react";
import { FormFieldSelectSchema } from "xylem";
import { ReadOnlyText } from "../ReadOnlyText";

type CustomFormMutliselectProps = CustomFormFieldProps<string[]> & {};

export const CustomFormMultiselect = ({
  formField,
  onValueChanged,
  isEditing,
  getValue,
}: CustomFormMutliselectProps) => {
  const [localValue, setLocalValue] = React.useState<string[]>(getValue() || []);

  const onOptionSelected = (e: SelectChangeEvent<typeof localValue>) => {
    const {
      target: { value: inputValue },
    } = e;
    const nextValue =
      typeof inputValue === "string" ? inputValue.split(",").filter(Boolean) : inputValue;
    setLocalValue(nextValue);
    onValueChanged(nextValue);
  };

  // fixme: there's something off with the typing here
  const fieldProperties = (formField as Omit<FormFieldSelectSchema, "value"> & { value: string[] })
    .properties;

  return isEditing ? (
    <Select
      multiple={true}
      onChange={onOptionSelected}
      renderValue={(selected) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {selected.map((value) => (
            <Tag key={value} label={value} />
          ))}
        </Box>
      )}
      sx={{
        alignSelf: "flex-start",
        width: "100%",
        "& fieldset": (theme) => ({ borderWidth: "2px", borderColor: "#777" }),
      }}
      value={localValue}
    >
      {fieldProperties?.options?.map((option, i) => {
        return (
          <MenuItem key={`option-${i}`} value={option.value}>
            {option.label}
          </MenuItem>
        );
      })}
    </Select>
  ) : (
    <ReadOnlyText
      // fixme: what even is this?
      value={localValue?.reduce((res, x, i) => `${res}${i > 0 ? ", " : ""}${x}`, "") || "—"}
    />
  );
};
