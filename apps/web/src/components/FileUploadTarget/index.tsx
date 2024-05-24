import { mergeSxStyles } from "@/util/misc";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { SxProps } from "@mui/material/styles";
import * as React from "react";

export const FileUploadTarget = React.forwardRef(function FileInput(
  {
    mimeTypes,
    sx,
    multiple = false,
    onFilesChanged,
  }: {
    mimeTypes?: string[];
    multiple?: boolean;
    onFilesChanged?: (files: File[]) => void;
    sx?: SxProps;
  },
  ref,
) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = React.useState<File[] | undefined>(undefined);
  const clear = React.useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = null as any;
      setFiles(undefined);
    }
  }, []);
  React.useImperativeHandle(
    ref,
    () => ({
      files,
      clear,
    }),
    [files, clear],
  );

  const onBrowseFilesClicked = () => {
    inputRef.current?.click();
  };

  const onInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selectedFiles);
    onFilesChanged?.(selectedFiles);
  };

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!multiple && droppedFiles && droppedFiles.length > 1) {
      return;
    }
    setFiles(droppedFiles);
    onFilesChanged?.(droppedFiles);
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!multiple && files && files.length > 1) {
      e.dataTransfer.effectAllowed = "none";
      e.dataTransfer.dropEffect = "none";
    }
  };
  return (
    <Stack
      direction={"row"}
      onDragOver={onDragOver}
      onDrop={onDrop}
      spacing={1}
      sx={mergeSxStyles(
        (theme) => ({
          alignItems: "center",
          borderRadius: `${theme.shape.borderRadius}px`,
          display: "flex",
          justifyContent: "center",
          minHeight: "40px",
          padding: "16px 32px",
          boxSizing: "border-box",
          background: theme.palette.primary.light,
        }),
        sx,
      )}
    >
      <input
        accept={mimeTypes ? mimeTypes.join(",") : undefined}
        multiple={multiple}
        name={multiple ? "files[]" : undefined}
        onChange={onInputChanged}
        ref={inputRef}
        style={{ opacity: 0, position: "absolute", visibility: "hidden", width: 0, height: 0 }}
        type="file"
      />
      <span>Drag and Drop or</span>
      <Button variant="outlined" onClick={onBrowseFilesClicked}>
        <FileUploadOutlinedIcon />
        <span>Browse files</span>
      </Button>
    </Stack>
  );
});
