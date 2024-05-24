import { mergeSxStyles } from "@/util/misc";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { SxProps, Theme } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";
import { FileAttachmentSchema } from "xylem";
import { FileUploadTarget } from "./FileUploadTarget";

export function FileChooser({
  file,
  hideLabel,
  mimeTypes,
  onFileChanged,
  sx,
}: {
  file?: File | FileAttachmentSchema;
  hideLabel?: boolean;
  mimeTypes?: string[];
  onFileChanged?: (file?: File) => void;
  sx?: SxProps<Theme>;
}) {
  const [value, setValue] = React.useState<Partial<File | FileAttachmentSchema | undefined>>(file);
  React.useEffect(() => {
    setValue(file);
  }, [file]);

  // fixme: what happens if we're undoing an attachment to a project or similar?
  const removeFileAttachment = (_?: File | FileAttachmentSchema) => () => {
    setValue(undefined);
    onFileChanged?.(undefined);
  };

  // fixme: this is hardcoded to single file
  const onFilesChanged = (files: File[] | undefined) => {
    const file = files?.[0];
    setValue(file);
    onFileChanged?.(file);
  };

  const renderContent = () => {
    if (value) {
      if ((value as FileAttachmentSchema).path) {
        const castValue = value as FileAttachmentSchema;
        return (
          <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
            <List
              sx={(theme) => ({
                background: theme.palette.success.light,
                borderRadius: `${theme.shape.borderRadius}px`,
                boxSizing: "border-box",
                minHeight: "40px",
                padding: theme.spacing(2, 4),
              })}
            >
              <ListItem
                sx={(t) => ({ border: "none", color: t.palette.success.main })}
                key={castValue.id}
              >
                <ListItemIcon sx={{ mr: 1 }}>
                  <SentimentSatisfiedAltIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={castValue.fileName}
                  primaryTypographyProps={{
                    sx: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
                  }}
                />
                <ListItemButton
                  onClick={removeFileAttachment(castValue)}
                  sx={{ flexGrow: 0, flexShrink: 0, ml: 1, color: (t) => t.palette.primary.main }}
                >
                  Remove
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        );
      } else {
        const localFile: File = value as any;
        return (
          <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
            <List
              sx={(theme) => ({
                background: theme.palette.primary.light,
                borderRadius: `${theme.shape.borderRadius}px`,
                padding: theme.spacing(2, 4),
              })}
            >
              <ListItem sx={(t) => ({ border: "none" })} key={`${localFile.name}`}>
                <ListItemIcon sx={{ mr: 1 }}>
                  <UploadFileOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={localFile.name}
                  primaryTypographyProps={{
                    sx: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
                  }}
                />
                <ListItemButton
                  onClick={removeFileAttachment(localFile)}
                  sx={{ flexGrow: 0, flexShrink: 0, ml: 1, color: (t) => t.palette.primary.main }}
                >
                  Remove
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        );
      }
    } else {
      return (
        <FileUploadTarget
          mimeTypes={mimeTypes}
          sx={{ width: "100%" }}
          multiple={false}
          onFilesChanged={onFilesChanged}
        />
      );
    }
  };
  return (
    <Box
      sx={mergeSxStyles(
        (theme) => ({
          border: "none",
          alignItems: "center",
          borderRadius: `${theme.shape.borderRadius}px`,
          display: "flex",
          justifyContent: "center",
          minHeight: "40px",
          boxSizing: "border-box",
        }),
        sx,
      )}
    >
      {renderContent()}
    </Box>
  );
}
