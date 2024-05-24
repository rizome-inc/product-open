import { DecisionLogicWrapper } from "@/components/CustomForms/DecisionLogic";
import { CustomFormFieldProps } from "@/types";
import { CustomFormCheckbox } from "../CustomFormCheckbox";
import { CustomFormDatePicker } from "../CustomFormDatePicker";
import { CustomFormDateRangePicker } from "../CustomFormDateRangePicker";
import { CustomFormFieldArray } from "../CustomFormFieldArray";
import { CustomFormFileChooser } from "../CustomFormFileChooser";
import { CustomFormMultiselect } from "../CustomFormMultiSelect";
import { CustomFormSelect } from "../CustomFormSelect";
import { CustomFormTagsField } from "../CustomFormTagsField";
import { CustomFormTextField } from "../CustomFormTextField";
import { FormColumns } from "../FormColumns";

export const CustomFormField = (props: CustomFormFieldProps) => {
  // special case
  if (props.formField.type == "decision-logic") {
    return <DecisionLogicWrapper {...props} />;
  }
  const inputElement: JSX.Element = (() => {
    const { formField } = props;
    switch (formField.type) {
      case "array": {
        return <CustomFormFieldArray {...props} />;
      }
      case "boolean": {
        return <CustomFormCheckbox {...props} />;
      }
      case "date": {
        return <CustomFormDatePicker {...props} />;
      }
      case "date-range": {
        return <CustomFormDateRangePicker {...props} />;
      }
      case "multi-select": {
        return <CustomFormMultiselect {...props} />;
      }
      case "select": {
        return <CustomFormSelect {...props} />;
      }
      case "tags": {
        return <CustomFormTagsField sx={{ flexGrow: 1 }} {...props} />;
      }
      case "text": {
        return (
          <CustomFormTextField
            sx={{ flexGrow: 1 }}
            editingProps={{ multiline: true, sx: { flexGrow: 1 } }}
            {...props}
          />
        );
      }
      case "short-text": {
        return <CustomFormTextField sx={{ flexGrow: 1 }} {...props} />;
      }
      case "image": {
        return <CustomFormFileChooser {...props} />;
      }
      case "file": {
        return <CustomFormFileChooser {...props} />;
      }
      default: {
        return <></>;
      }
    }
  })();

  return (
    <FormColumns
      label={props.formField.label}
      inputElement={inputElement}
      description={props.formField.description}
      sx={props.sx}
    />
  );
};
