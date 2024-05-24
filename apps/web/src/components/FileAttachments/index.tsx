import { FileUploadTarget } from "@/components/FileUploadTarget";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import { mergeSxStyles } from "@/util/misc";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { SxProps } from "@mui/material/styles";
import { Stack } from "@mui/system";
import * as React from "react";
import { FileAttachmentSchema } from "xylem";
import { FileAttachmentsDisplay } from "./presentation";

export function DiscussionFileAttachments({ sx }: { sx?: SxProps }) {
  const { discussion } = useDiscussionContext();
  const { isEditing, setFilesToAttach, filesToAttach, setFileAttachmentsToRemove } =
    useDiscussionEditingContext();
  const [existingFileAttachments, setExistingFileAttachments] = React.useState<
    FileAttachmentSchema[] | null
  >(null);
  React.useEffect(() => {
    if (discussion && isEditing) {
      setExistingFileAttachments(discussion.fileAttachments || null);
    }
  }, [isEditing, discussion]);

  const removeFileAttachment = (fileAttachment: FileAttachmentSchema) => () => {
    setFileAttachmentsToRemove((v) => {
      const next = [...(v || [])];
      const ids = next.map((x) => x.id);
      if (!ids.includes(fileAttachment.id)) {
        next.push(fileAttachment);
      }
      return next;
    });
    setExistingFileAttachments((v) => v!.filter((x) => x.id !== fileAttachment.id));
  };

  const removeFileToAttach = (file: File) => () => {
    setFilesToAttach((v) => v?.filter((x) => x !== file));
  };

  if (isEditing) {
    return (
      <Box
        sx={mergeSxStyles((theme) => ({
          alignItems: "center",
          borderRadius: `${theme.shape.borderRadius}px`,
          display: "flex",
          justifyContent: "center",
          boxSizing: "border-box",
        }))}
      >
        {existingFileAttachments && existingFileAttachments.length > 0 ? (
          <Box sx={{ alignSelf: "flex-start", width: "100%", mb: 2 }}>
            <Typography variant="em">Upload file</Typography>
            <List
              sx={(theme) => ({
                background: theme.palette.success.light,
                borderRadius: `${theme.shape.borderRadius}px`,
                padding: theme.spacing(2, 4),
              })}
            >
              {existingFileAttachments?.map((x) => {
                return (
                  <ListItem
                    sx={(t) => ({ border: "none", color: t.palette.success.main })}
                    key={x.id}
                  >
                    <ListItemIcon sx={{ mr: 1 }}>
                      <SentimentSatisfiedAltIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={x.fileName}
                      primaryTypographyProps={{
                        sx: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
                      }}
                    />
                    <ListItemButton
                      onClick={removeFileAttachment(x)}
                      sx={{
                        flexGrow: 0,
                        flexShrink: 0,
                        ml: 1,
                        color: (t) => t.palette.primary.main,
                      }}
                    >
                      Remove
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ) : (
          <Stack spacing={0} direction={"column"} sx={{ width: "100%", mb: 2 }}>
            <Typography variant="em">Upload file</Typography>
            {filesToAttach && filesToAttach.length > 0 ? (
              <Box
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  display: "flex",
                  justifyContent: "center",
                  minHeight: "40px",
                  padding: "16px 32px",
                  boxSizing: "border-box",
                  background: theme.palette.primary.light,
                })}
              >
                <List>
                  {filesToAttach.map((x, i) => {
                    return (
                      <ListItem sx={(t) => ({ border: "none" })} key={`${x.name}-${i}`}>
                        <ListItemIcon sx={{ mr: 1 }}>
                          <UploadFileOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={x.name}
                          primaryTypographyProps={{
                            sx: {
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                          }}
                        />
                        <ListItemButton
                          onClick={removeFileToAttach(x)}
                          sx={{
                            flexGrow: 0,
                            flexShrink: 0,
                            ml: 1,
                            color: (t) => t.palette.primary.main,
                          }}
                        >
                          Remove
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ) : (
              <FileUploadTarget onFilesChanged={setFilesToAttach} />
            )}
          </Stack>
        )}
      </Box>
    );
  }

  if (!discussion?.fileAttachments?.length) {
    return null;
  }

  return <FileAttachmentsDisplay fileAttachments={discussion.fileAttachments} />;
}
