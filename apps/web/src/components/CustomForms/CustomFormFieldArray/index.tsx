import { AddButton } from "@/components/AddButton";
import { ChildProps } from "@/components/Project/ProjectContentCategory";
import { CustomFormFieldProps } from "@/types/forms";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import * as React from "react";
import { v4 as uuidgen } from "uuid";
import { FormFieldArraySchema, FormFieldType } from "xylem";
import { CustomFormTextField } from "../CustomFormTextField";

type CustomFormFieldArrayProps = CustomFormFieldProps<any[]> & {};
type CustomFormFieldArrayChildProps = ChildProps & CustomFormFieldProps<any>;

const defaultValueForFormFieldType = (type: FormFieldType) => {
  switch (type) {
    case "short-text": {
      return "";
    }
    default: {
      return null;
    }
  }
};

export const CustomFormFieldArray = ({
  formField,
  onValueChanged,
  isEditing,
  getValue,
  hideLabel,
  sx,
}: CustomFormFieldArrayProps) => {
  // fixme: there's something off with the typing here. can we type narrow the union?
  const castFormField = formField as Omit<FormFieldArraySchema, "value"> & { value: any[] };
  const [localValue, setLocalValue] = React.useState<any[]>(getValue() || [""]);

  // fixme: make more consistent with ProjectContentCategory
  const createChildFieldProps = React.useCallback(
    (fieldValue: any, index: number): CustomFormFieldArrayChildProps => {
      return {
        formField: {
          type: castFormField.subtype,
          value: fieldValue,
          label: "",
          required: castFormField.required,
        },
        hideLabel: true,
        key: uuidgen(),
        onValueChanged: (val) => {
          setLocalValue((v) => {
            const next = [...v];
            next.splice(index, 1, val);
            onValueChanged(next);
            return next;
          });
        },
        getValue: () => fieldValue,
      };
    },
    [castFormField.required, castFormField.subtype, onValueChanged],
  );

  const [childFieldProps, setChildFieldProps] = React.useState<CustomFormFieldArrayChildProps[]>(
    () =>
      localValue?.length > 0
        ? localValue.map(createChildFieldProps)
        : [createChildFieldProps(defaultValueForFormFieldType(castFormField.subtype!), 0)],
  );

  const addChildField = () => {
    setChildFieldProps((v) => {
      return [
        ...v,
        createChildFieldProps(defaultValueForFormFieldType(castFormField.subtype!), v.length),
      ];
    });
  };

  const removeChildField = (index: number) => () => {
    setChildFieldProps((v) => {
      const next = [...v];
      next.splice(index, 1);
      return next;
    });
  };

  return (
    <Stack direction="column" spacing={1} sx={sx}>
      {childFieldProps.map(({ key, ...restProps }, i) => {
        return (
          <Stack key={key} direction="row" spacing={1.5}>
            <CustomFormTextField sx={{ flexGrow: 1 }} {...restProps} isEditing={isEditing} />
            {/* <CustomFormField {...restProps} isEditing={isEditing} /> */}
            {isEditing && (
              <IconButton
                onClick={removeChildField(i)}
                sx={{ alignSelf: "flex-start", borderRadius: "4px" }}
              >
                <CloseIcon color={"warning"} />
              </IconButton>
            )}
          </Stack>
        );
      })}
      {isEditing && <AddButton sx={{ alignSelf: "flex-start" }} onClick={addChildField} />}
    </Stack>
  );
};
