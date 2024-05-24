import { InputField } from "@/components/InputField";
import { Tag } from "@/components/Tag";
import { TagTokenField } from "@/components/TagTokenField";
import { CustomFormFieldProps } from "@/types/forms";
import Grid from "@mui/material/Grid";
import * as React from "react";

type CustomFormTagFieldProps = CustomFormFieldProps & {
  singleTag?: boolean;
};

export const CustomFormTagsField = ({
  formField,
  getValue,
  isEditing,
  onTransformOutputValue,
  onValueChanged,
  singleTag,
}: CustomFormTagFieldProps) => {
  const [localValue, setLocalValue] = React.useState<string[]>(() => {
    const v = getValue();
    return Array.isArray(v) ? v : v ? [v] : [];
  });

  const onTagsChanged = (tags: string[]) => {
    setLocalValue(tags);
    onValueChanged?.(onTransformOutputValue ? onTransformOutputValue(tags) : tags);
  };

  const onSingleTagInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = [e.target.value];
    setLocalValue(tags);
    onValueChanged(onTransformOutputValue ? onTransformOutputValue(tags) : tags);
  };

  if (isEditing) {
    if (singleTag) {
      return <InputField value={localValue?.[0] || ""} onChange={onSingleTagInputChanged} />;
    } else {
      return (
        <TagTokenField
          onTagsChanged={onTagsChanged}
          tags={localValue}
          sx={{ borderColor: "#777" }}
        />
      );
    }
  } else {
    return (
      <Grid container={true} spacing={1}>
        {localValue.map((x, i) => {
          return (
            <Grid key={`${x}-${i}`} item={true}>
              <Tag label={x} />
            </Grid>
          );
        })}
      </Grid>
    );
  }
};
