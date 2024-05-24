import { CustomFormField } from "@/components/CustomForms/CustomFormField";
import { useProjectEditingContext } from "@/context/project";
import { CustomFormFieldProps } from "@/types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/material/styles";
import * as React from "react";
import { v4 as uuidgen } from "uuid";
import { FormFieldSchema, ProjectContentCategorySchema } from "xylem";

export type ChildProps = { key: string } & Pick<
  CustomFormFieldProps<any>,
  "onValueChanged" | "getValue"
>;

// fixme(cleanup)
// fixme: test that this protects against undefined value errors
export function ProjectContentCategory({
  category,
  sx,
}: {
  category: ProjectContentCategorySchema;
  sx?: SxProps<Theme>;
}) {
  const { setValueForField, getValueForField, isEditing } = useProjectEditingContext();

  const childProps: ChildProps[] = React.useMemo(() => {
    return category.fields
      ?.filter((f) => f.id !== undefined)
      .map((f) => ({
        key: uuidgen(),
        onValueChanged: (value) => setValueForField(f.id!, value),
        getValue: () => getValueForField(f.id!),
      }));
  }, [category.fields, setValueForField, getValueForField]);

  return (
    <Stack spacing={2} direction="column" sx={sx}>
      {category.description && <Typography>{category.description}</Typography>}

      {category.fields
        ?.filter((f) => f.id !== undefined)
        .map((f, i) => {
          const formField = f as Omit<FormFieldSchema, "value"> & { value?: any };
          const baseProps = { isEditing, formField, ...childProps[i] };
          return <CustomFormField {...baseProps} key={baseProps.key} />;
        })}
    </Stack>
  );
}
