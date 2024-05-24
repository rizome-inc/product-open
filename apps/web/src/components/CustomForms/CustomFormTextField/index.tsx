import { InputField, InputFieldProps } from "@/components/InputField";
import { CustomFormFieldProps } from "@/types/forms";
import { SxProps } from "@mui/material";
import * as React from "react";
import { ReadOnlyText } from "../ReadOnlyText";

type CustomFormTextFieldProps = CustomFormFieldProps & {
  editingProps?: Omit<InputFieldProps, "value" | "ref" | "minRows" | "onChange"> & {
    editingSxProps?: SxProps;
  };
};

export const CustomFormTextField = (props: CustomFormTextFieldProps) => {
  const {
    editingProps,
    formField,
    getValue,
    hideLabel,
    isEditing,
    onTransformOutputValue,
    onValueChanged,
    sx,
  } = props;

  const [localValue, setLocalValue] = React.useState<string | undefined>(getValue());

  const onInputChanged = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = target.value || "";
    setLocalValue(nextValue);
    onValueChanged(onTransformOutputValue ? onTransformOutputValue(nextValue) : nextValue);
  };

  const { multiline, ...restEditingProps } = editingProps || {};

  return isEditing ? (
    <InputField
      {...restEditingProps}
      minRows={multiline ? 2 : undefined}
      multiline={multiline}
      onChange={onInputChanged}
      value={localValue}
    />
  ) : (
    <ReadOnlyText value={localValue} />
  );
};
