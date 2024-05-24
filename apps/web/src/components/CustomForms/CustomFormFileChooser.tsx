import { FileAttachmentsDisplay } from "@/components/FileAttachments/presentation";
import { useProjectContext } from "@/context/project";
import { CustomFormFieldProps } from "@/types";
import Box from "@mui/material/Box";
import * as React from "react";
import { FileAttachmentSchema } from "xylem";
import { FileChooser } from "../FileChooser";

type CustomFormFileChooserProps = CustomFormFieldProps<
  FileAttachmentSchema | File | undefined
> & {};

export const CustomFormFileChooser = ({
  formField,
  onValueChanged,
  isEditing,
  getValue,
}: CustomFormFileChooserProps) => {
  const { project } = useProjectContext();

  const [localValue, setLocalValue] = React.useState<FileAttachmentSchema | File | undefined>(
    getValue() || undefined, // todo: should I safeParse `getValue()`?
  );

  const onSelectionChanged = async (file?: File) => {
    if (!file) {
      setLocalValue(undefined);
      onValueChanged(undefined);
    } else if (project?.id) {
      setLocalValue(file);
      onValueChanged(file);
    }
  };

  return (
    <Box>
      {isEditing ? (
        <FileChooser file={localValue} onFileChanged={onSelectionChanged} />
      ) : (
        <FileAttachmentsDisplay
          fileAttachments={
            (localValue as FileAttachmentSchema)?.path ? [localValue as FileAttachmentSchema] : []
          }
        />
      )}
    </Box>
  );
};
