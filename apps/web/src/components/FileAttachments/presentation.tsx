import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { mergeSxStyles } from "@/util/misc";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, CardActions, CardContent, IconButton } from "@mui/material";
import Card from "@mui/material/Card";
import { SxProps } from "@mui/material/styles";
import { Theme } from "@mui/system";
import Link from "next/link";
import { FileIcon, defaultStyles } from "react-file-icon";
import { FileAttachmentSchema } from "xylem";
// import sharp from "sharp";
import { Image } from "image-js";

import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

function RenderImageRepresentation({
  fileAttachment,
  hasThumbnail,
  setHasThumbnail,
}: {
  fileAttachment: FileAttachmentSchema;
  hasThumbnail: boolean;
  setHasThumbnail: Dispatch<SetStateAction<boolean>>;
}) {
  // todo: come up with more complete list of extensions we don't want to make a thumbnail for
  const NO_THUMBNAIL = [
    "pages",
    "key",
    "numbers",
    "xls",
    "xlsx",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "pdf",
  ];

  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined);

  const splitFileName = fileAttachment.fileName.split(".");
  const ext = splitFileName.pop() || "";

  useEffect(() => {
    if (hasThumbnail && fileAttachment.downloadUrl) {
      axios
        .get<ArrayBuffer>(fileAttachment.downloadUrl, { responseType: "arraybuffer" })
        .then((value) => {
          Image.load(value.data).then((i) =>
            setThumbnailUrl(i.resize({ width: 200, height: 200 }).toDataURL()),
          );
        });
    }
  }, [fileAttachment.downloadUrl, hasThumbnail]);

  if (NO_THUMBNAIL.includes(ext)) {
    return (
      <Box sx={{ width: "200px" }}>
        <FileIcon cl extension={ext} {...((defaultStyles as any)[ext] || {})} />
      </Box>
    );
  } else {
    setHasThumbnail(true);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailUrl || "/"}
        alt={`thumbnail for ${fileAttachment.fileName}`}
        style={{ width: "100%" }}
      />
    );
  }
}

export function FileAttachmentsDisplay({
  fileAttachments,
  sx,
}: {
  fileAttachments: FileAttachmentSchema[];
  sx?: SxProps<Theme>;
}) {
  const [hasThumbnail, setHasThumbnail] = useState<boolean>(false);

  if (fileAttachments.length === 0) return <ReadOnlyText />;

  return (
    <>
      {fileAttachments.map((fileAttachment) => {
        return (
          <>
            <Card
              elevation={0}
              sx={mergeSxStyles(
                (theme) => ({
                  alignSelf: "flex-start",
                  border: "none",
                  mb: 2,
                  borderRadius: `${theme.shape.borderRadius}px`,
                  boxSizing: "border-box",
                  lineHeight: 0,
                  minHeight: "40px",
                  overflow: "hidden",
                  padding: hasThumbnail ? 0 : 2,
                  position: "relative",
                  "& .MuiCardActions-root": {
                    display: "none",
                  },
                  "&:hover .MuiCardActions-root": {
                    display: "flex",
                  },
                }),
                sx,
              )}
            >
              <CardContent sx={{ padding: 0 }}>
                <RenderImageRepresentation
                  key={fileAttachment.id}
                  fileAttachment={fileAttachment}
                  hasThumbnail={hasThumbnail}
                  setHasThumbnail={setHasThumbnail}
                />
              </CardContent>
              <CardActions
                sx={(t) => ({
                  alignItems: "center",
                  borderTop: `2px solid ${t.palette.divider}`,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "flex-start",
                  left: 0,
                  padding: 1,
                  position: "absolute",
                  right: 0,
                  width: "100%",
                  zIndex: 1,
                  background: "#ffffffaa",
                  "& *": {
                    height: "20px",
                    width: "20px",
                    color: t.palette.primary.main,
                  },
                })}
              >
                <IconButton LinkComponent={Link} href={`${fileAttachment.downloadUrl}&download=`}>
                  <FileDownloadOutlinedIcon />
                </IconButton>
              </CardActions>
            </Card>
          </>
        );
      })}
    </>
  );
}
