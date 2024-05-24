import { InputField } from "@/components/InputField";
import { useErrorModalContext } from "@/context/errorModals";
import { useCreateFlowProjectMutation } from "@/queries/projects/useCreateFlowProjectMutation";
import { LoadingButton } from "@mui/lab";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/router";
import * as React from "react";
import { CreateFlowProjectSchema, createFlowProjectSchema } from "xylem";
import { DialogModal } from "../DialogModal";

export type AddFlowProjectModalProps = {
  onRequestClose: () => void;
  open: boolean;
};

export function AddFlowProjectModal({ open, onRequestClose }: AddFlowProjectModalProps) {
  const [isLoading, setIsLoading] = React.useState<boolean | undefined>();

  const { isLoading: isCreatingProject, mutateAsync: createProjectMutation } =
    useCreateFlowProjectMutation();
  const { showErrorModal } = useErrorModalContext();
  const router = useRouter();

  const [businessUnit, setBusinessUnit] = React.useState<string | undefined>(undefined);
  const [name, setName] = React.useState<string | undefined>(undefined);

  const setProjectProperty =
    (propertyName: "name" | "businessUnit") => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (propertyName === "name") {
        setName(e.target.value);
      } else {
        setBusinessUnit(e.target.value);
      }
    };

  const createProject = async () => {
    const request: Partial<CreateFlowProjectSchema> = {
      businessUnit,
      name,
    };

    try {
      const parsedRequest = createFlowProjectSchema.parse(request);
      const project = await createProjectMutation(parsedRequest);
      // We can't conditionally invoke the project controller hook so we pass some URL params instead
      router.push(`/projects/${project.id}?edit=true`);
      // todo: still necessary if we redirect?
      cancel();
    } catch (error) {
      showErrorModal(error);
    }
  };

  const cancel = () => {
    setBusinessUnit(undefined);
    setName(undefined);
    onRequestClose?.();
  };

  // todo: this modal needs to be wider to match design
  return (
    <DialogModal
      actions={
        <>
          <Button
            id="addProjectCancel2"
            variant="outlined"
            onClick={cancel}
            disabled={isLoading || isCreatingProject}
          >
            Cancel
          </Button>
          <LoadingButton
            id="addProjectFinish"
            loading={isLoading || isCreatingProject}
            onClick={createProject}
            variant="contained"
          >
            Save
          </LoadingButton>
        </>
      }
      onClose={cancel}
      closeId="addProjectCancel1"
      keepMounted={false}
      open={open}
      title={"Add Project"}
    >
      <Stack spacing={2} direction={"column"} sx={{ width: 512 }}>
        <>
          <InputField
            autoFocus={true}
            label="Name"
            value={name || ""}
            onChange={setProjectProperty("name")}
          />
          <InputField
            label="What team is the primary stakeholder for this project?"
            value={businessUnit || ""}
            onChange={setProjectProperty("businessUnit")}
          />
        </>
      </Stack>
    </DialogModal>
  );
}
