import { BaseDatePicker } from "@/components/BaseDatePicker/indext";
import { CustomFormFieldProps } from "@/types/forms";
import moment, { Moment, MomentInput } from "moment";
import * as React from "react";
import { ReadOnlyText } from "../ReadOnlyText";

type CustomFormDatePickerProps = CustomFormFieldProps<MomentInput>;

const DateFormat = `MMM Do, YYYY`;

const toMoment = (inputValue?: MomentInput) => {
  return inputValue ? moment(inputValue) : null;
};

// fixme: replace moment with dayjs
export const CustomFormDatePicker = ({
  formField,
  onValueChanged,
  isEditing,
  getValue,
}: CustomFormDatePickerProps) => {
  const [localValue, setLocalValue] = React.useState<Moment | undefined | null>(
    toMoment(getValue() || undefined),
  );

  const onChange = (newValue: Moment | null) => {
    setLocalValue(newValue);
    onValueChanged(newValue?.toDate() || null);
  };

  return isEditing ? (
    <BaseDatePicker value={localValue} onChange={onChange} />
  ) : (
    <ReadOnlyText value={localValue ? localValue.format(DateFormat) : undefined} />
  );
};
