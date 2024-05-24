import { DrawerModal } from "@/components/DrawerModal";
import { InputField } from "@/components/InputField";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { DiscussionLinkedDocumentsSchema, discussionLinkedDocumentsSchema } from "xylem";

type DiscussionAddLinkedDocumentModalProps = {
  linkedDocument?: DiscussionLinkedDocumentsSchema;
  onRequestClose?: (changesMade?: boolean) => void;
  open?: boolean;
};

export function EditDiscussionLinkedDocumentModal({
  onRequestClose,
  open,
  linkedDocument: initialLinkedDocument,
}: DiscussionAddLinkedDocumentModalProps) {
  const { showErrorModal } = useErrorModalContext();
  const { toastSuccess } = useToaster();
  const isEditing = Boolean(initialLinkedDocument);

  const { discussion } = useDiscussionContext();
  const { createLinkedDocumentMutation, updateLinkedDocumentMutation } =
    useDiscussionEditingContext();
  const [linkedDocument, setLinkedDocument] = React.useState<DiscussionLinkedDocumentsSchema>(
    initialLinkedDocument ?? { name: "", url: "" },
  );
  React.useEffect(() => {
    setLinkedDocument(initialLinkedDocument ?? { name: "", url: "" });
  }, [initialLinkedDocument]);

  const reset = () => {
    setLinkedDocument({ name: "", url: "" });
  };

  const onCancel = () => {
    reset();
    onRequestClose?.(false);
  };

  const setValue = React.useCallback(
    <TKey extends keyof DiscussionLinkedDocumentsSchema>(
      key: TKey,
      value: Partial<DiscussionLinkedDocumentsSchema>[TKey],
    ) => {
      setLinkedDocument((v) => ({
        ...(v || {}),
        [key]: value,
      }));
    },
    [],
  );

  const saveAsync = async () => {
    if (discussion?.id) {
      try {
        await discussionLinkedDocumentsSchema.parse(linkedDocument);
        if (isEditing) {
          if (linkedDocument.id) {
            await updateLinkedDocumentMutation.mutateAsync({
              discussionId: discussion.id,
              documentId: linkedDocument.id,
              request: linkedDocument,
            });
            toastSuccess("Linked document updated.");
          }
        } else {
          await createLinkedDocumentMutation.mutateAsync({
            id: discussion.id,
            linkedDocument,
          });
          toastSuccess("Linked document created.");
        }
        reset();
        onRequestClose?.(true);
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  const isLoading =
    updateLinkedDocumentMutation.isLoading || createLinkedDocumentMutation.isLoading;

  return (
    <DrawerModal
      anchor="right"
      onClose={onCancel}
      open={open}
      header={
        <Typography noWrap={true} variant="h2">
          {isEditing ? "Edit" : "Add"} Linked Document
        </Typography>
      }
      headerActions={
        <>
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingActionButton variant="contained" onClick={saveAsync} loading={isLoading}>
            Save
          </LoadingActionButton>
        </>
      }
    >
      <Grid container={true} direction="row" spacing={2}>
        <Grid item={true} xs={6}>
          <Stack spacing={2} direction="column">
            <InputField
              label="Url"
              onChange={({ target }) => setValue("url", target.value || "")}
              value={linkedDocument?.url || ""}
            />
            <InputField
              label="Document Name"
              onChange={({ target }) => setValue("name", target.value || "")}
              value={linkedDocument?.name || ""}
            />
          </Stack>
        </Grid>
      </Grid>
      <Grid container={true} direction="row" sx={{ mt: 2 }} spacing={2}>
        <Grid item={true} xs={6}>
          <InputField
            label="Location Name"
            onChange={({ target }) => setValue("locationName", target.value || "")}
            value={linkedDocument?.locationName || ""}
          />
        </Grid>
        <Grid item={true} xs={6}>
          <Card
            sx={{
              background: "#eee",
              padding: "6px 16px",
              boxShadow: "none",
            }}
          >
            <Typography color={(theme) => theme.palette.text.secondary}>
              Examples: Confluence, Google Docs, Miro
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </DrawerModal>
  );
}
