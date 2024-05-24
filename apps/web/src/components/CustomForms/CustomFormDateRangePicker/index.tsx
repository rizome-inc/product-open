import { BaseDatePicker } from "@/components/BaseDatePicker/indext";
import { CustomFormFieldProps } from "@/types/forms";
import Stack from "@mui/material/Stack";
import moment, { Moment, MomentInput } from "moment";
import * as React from "react";
import { FormFieldDateRangeSchema } from "xylem";
import { ReadOnlyText } from "../ReadOnlyText";

type CustomFormDateRangePickerProps = CustomFormFieldProps<FormFieldDateRangeSchema>;

const DateFormat = `MMM Do, YYYY`;

const toMoment = (inputValue?: MomentInput) => {
  return inputValue ? moment(inputValue) : null;
};

// fixme: replace momment with dayjs
export const CustomFormDateRangePicker = ({
  formField,
  onValueChanged,
  isEditing,
  getValue,
}: CustomFormDateRangePickerProps) => {
  const [startValue, setStartValue] = React.useState<Moment | undefined | null>(
    toMoment(getValue()?.start),
  );

  const [endValue, setEndValue] = React.useState<Moment | undefined | null>(
    toMoment(getValue()?.end),
  );

  const onStartMomentChange = (newValue: Moment | null) => {
    setStartValue(newValue);
    onValueChanged({
      end: endValue?.toISOString(),
      start: newValue?.toISOString(),
    });
  };

  const onEndMomentChange = (newValue: Moment | null) => {
    setEndValue(newValue);
    onValueChanged({
      end: newValue?.toISOString(),
      start: startValue?.toISOString(),
    });
  };

  return isEditing ? (
    <Stack direction="row" spacing={1} alignItems={"center"}>
      <BaseDatePicker value={startValue} onChange={onStartMomentChange} />
      <span>to</span>
      <BaseDatePicker value={endValue} onChange={onEndMomentChange} />
    </Stack>
  ) : (
    <ReadOnlyText
      value={
        !startValue && !endValue
          ? "—"
          : `${startValue ? startValue.format(DateFormat) : "\u2014"}  to  ${
              endValue ? endValue.format(DateFormat) : "\u2014"
            }`
      }
    />
  );
};
