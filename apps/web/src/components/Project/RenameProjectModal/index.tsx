import { DialogModal } from "@/components/DialogModal";
import { InputField } from "@/components/InputField";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { useRenameProjectMutation } from "@/queries/project/useRenameProjectMutation";
import { LoadingButton } from "@mui/lab";
import Button from "@mui/material/Button";
import * as React from "react";
import { FlowProjectSchema, ProjectSchema } from "xylem";
import { z } from "zod";

export type RenameProjectModalProps = {
  onRequestClose: (updatedName?: string) => void;
  open: boolean;
  project?: ProjectSchema | FlowProjectSchema;
};

export function RenameProjectModal({ open, onRequestClose, project }: RenameProjectModalProps) {
  const { isLoading, mutateAsync: renameAsync } = useRenameProjectMutation();
  const { toastSuccess } = useToaster();
  const { showErrorModal } = useErrorModalContext();

  const [name, setName] = React.useState<string>(project?.name || "");
  React.useEffect(() => {
    if (open) {
      setName(project?.name || "");
    }
  }, [project?.name, open]);

  const close = () => {
    setName("");
    onRequestClose();
  };

  const onSaveClicked = async () => {
    if (project?.id) {
      try {
        const value = name?.trim();
        z.string().parse(value);
        const res = await renameAsync({ id: project.id, name: value });
        setName(res.name);
        onRequestClose(name);
        toastSuccess(`Project renamed successfully.`);
      } catch (error) {
        showErrorModal(error);
      }
    }
  };

  const onNameFieldChanged = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setName(target.value);
  };

  return (
    <DialogModal
      actions={
        <>
          <Button variant="outlined" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton disabled={isLoading} variant="contained" onClick={onSaveClicked}>
            Save
          </LoadingButton>
        </>
      }
      onClose={close}
      keepMounted={false}
      open={open}
      title={"Rename Project"}
    >
      <InputField
        label="Name"
        sx={{ width: { xs: "100%", sm: 500 } }}
        value={name}
        onChange={onNameFieldChanged}
      />
    </DialogModal>
  );
}
