import { BaseCheckbox } from "@/components/BaseCheckbox";
import { CustomFormFieldProps } from "@/types/forms";
import FormControlLabel from "@mui/material/FormControlLabel";
import * as React from "react";
import { ReadOnlyText } from "../ReadOnlyText";

type CustomFormCheckboxProps = CustomFormFieldProps<boolean>;

export const CustomFormCheckbox = ({
  formField,
  onValueChanged,
  isEditing,
  getValue,
}: CustomFormCheckboxProps) => {
  const [localValue, setLocalValue] = React.useState<boolean | undefined>(getValue() || false);

  const onInputChanged = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = target.checked;
    setLocalValue(nextValue);
    onValueChanged(nextValue);
  };

  if (isEditing) {
    return (
      <FormControlLabel
        control={<BaseCheckbox checked={localValue} onChange={onInputChanged} />}
        label={formField.label}
        labelPlacement="end"
        value={formField.label}
      />
    );
  }
  if (localValue === undefined) {
    return <ReadOnlyText />;
  } else {
    return (
      <div>
        <FormControlLabel
          control={<BaseCheckbox checked={localValue} onChange={onInputChanged} />}
          disabled={true}
          label={""}
          labelPlacement="end"
          value={""}
        />
      </div>
    );
  }
};
