import { MoreMenu } from "@/components/MoreMenu";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { openUrlInNewTab } from "@/util/misc";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { DiscussionLinkedDocumentsSchema } from "xylem";
import { EditDiscussionLinkedDocumentModal } from "../EditDiscussionLinkedDocumentModal";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  "&:not(:first-of-type)": {
    marginTop: theme.spacing(1.5),
  },
}));

export function DiscussionLinkedDocuments() {
  const { discussion } = useDiscussionContext();
  const [showEditLinkedDocument, setShowEditLinkedDocument] = React.useState<boolean>(false);
  const [selectedLinkedDocument, setSelectedLinkedDocument] = React.useState<
    DiscussionLinkedDocumentsSchema | undefined
  >(undefined);
  const { removeLinkedDocumentMutation } = useDiscussionEditingContext();
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess } = useToaster();

  const onRemove = (linkedDocument: DiscussionLinkedDocumentsSchema) => async () => {
    try {
      if (discussion?.id && linkedDocument?.id) {
        await removeLinkedDocumentMutation.mutateAsync({
          discussionId: discussion.id,
          documentId: linkedDocument.id,
        });
        toastSuccess("Linked document removed.");
      }
    } catch (error) {
      showErrorModal(error);
    }
  };

  const onEditLinkedDocumentModalRequestClose = () => {
    setSelectedLinkedDocument(undefined);
    setShowEditLinkedDocument(false);
  };

  const onEditLinkedDocument = (linkedDocument: DiscussionLinkedDocumentsSchema) => () => {
    setSelectedLinkedDocument(linkedDocument);
  };

  const onOpenInNewTab = (url: string) => () => openUrlInNewTab(url);

  return (
    <>
      <Button variant="outlined" onClick={() => setShowEditLinkedDocument(true)}>
        Add Link
      </Button>
      <List>
        {discussion?.linkedDocuments?.map((linkedDocument) => {
          return (
            <StyledListItem key={linkedDocument.id}>
              <ListItemButton onClick={onOpenInNewTab(linkedDocument.url)}>
                <ListItemText sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {linkedDocument.name}
                    {linkedDocument.locationName ? (
                      <>
                        &nbsp;<Typography>{"\u2014"}</Typography>&nbsp;
                        <Typography variant="tertiary">{linkedDocument.locationName}</Typography>
                      </>
                    ) : null}
                  </Box>
                </ListItemText>
                <ListItemIcon>
                  <MoreMenu>
                    <MenuItem onClick={onOpenInNewTab(linkedDocument.url)}>
                      Open in new tab
                    </MenuItem>
                    <MenuItem onClick={onEditLinkedDocument(linkedDocument)}>Edit</MenuItem>
                    <MenuItem onClick={onRemove(linkedDocument)}>Remove</MenuItem>
                  </MoreMenu>
                </ListItemIcon>
              </ListItemButton>
            </StyledListItem>
          );
        })}
      </List>
      <EditDiscussionLinkedDocumentModal
        linkedDocument={selectedLinkedDocument}
        onRequestClose={onEditLinkedDocumentModalRequestClose}
        open={showEditLinkedDocument || Boolean(selectedLinkedDocument)}
      />
    </>
  );
}
