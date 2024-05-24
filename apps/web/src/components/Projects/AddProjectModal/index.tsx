import { InputField } from "@/components/InputField";
import { useErrorModalContext } from "@/context/errorModals";
import { DEFAULT_TEMPLATE_NAMES } from "@/pages/templates";
import { useCreateProjectFromTemplateMutation, useProjectTemplatesQuery } from "@/queries";
import { partition } from "@/util/array";
import { LoadingButton } from "@mui/lab";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/router";
import * as React from "react";
import {
  CreateProjectFromTemplateSchema,
  TemplateSchema,
  createProjectFromTemplateSchema,
} from "xylem";
import { DialogModal } from "../../DialogModal";
import { ProjectTemplateListItem } from "./presentation";

export type AddProjectModalProps = {
  onRequestClose: () => void;
  open: boolean;
};

export function AddProjectModal({ open, onRequestClose }: AddProjectModalProps) {
  // dev note: this is copied from templates/index
  const [templates, setTemplates] = React.useState<TemplateSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean | undefined>();
  const templateQueryResult = useProjectTemplatesQuery({});

  React.useEffect(() => {
    if (templateQueryResult.data) {
      const [defaultTemplates, customTemplates] = partition(templateQueryResult.data, (t) =>
        DEFAULT_TEMPLATE_NAMES.includes(t.name),
      );
      // Sort by template id ascending...
      customTemplates.sort((a, b) => {
        if (a.id && b.id) {
          if (a.id < b.id) return 1;
          else if (a.id == b.id) return 0;
          else return -1;
        }
        return -1;
      });

      // except for default templates, which are ordered in a specific way
      const orderedDefaultTemplates = DEFAULT_TEMPLATE_NAMES.reduce((acc, n) => {
        const t = defaultTemplates.find((x) => x.name == n);
        if (t) {
          acc.push(t);
        }
        return acc;
      }, new Array<TemplateSchema>());
      setTemplates([...customTemplates, ...orderedDefaultTemplates]);
    }
    if (templateQueryResult.isLoading !== undefined) {
      setIsLoading(templateQueryResult.isLoading);
    }
  }, [templateQueryResult.data, templateQueryResult.isLoading]);

  const { isLoading: isCreatingProject, mutateAsync: createFromTemplateAsync } =
    useCreateProjectFromTemplateMutation();
  const { showErrorModal } = useErrorModalContext();
  const router = useRouter();

  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSchema | null>(null);
  const [businessUnit, setBusinessUnit] = React.useState<string | undefined>(undefined);
  const [name, setName] = React.useState<string | undefined>(undefined);

  const onTemplateItemClicked = (template: TemplateSchema) => () => setSelectedTemplate(template);

  const setProjectProperty =
    (propertyName: "name" | "businessUnit") => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (propertyName === "name") {
        setName(e.target.value);
      } else {
        setBusinessUnit(e.target.value);
      }
    };

  const createProject = async () => {
    const request: Partial<CreateProjectFromTemplateSchema> = {
      businessUnit,
      name,
      templateId: selectedTemplate?.id ?? undefined,
    };

    try {
      // We don't know if everything will be filled out yet, so parsedRequest works kind of like Required<Partial<CreateProjectFromTemplateSchema>>
      const parsedRequest = createProjectFromTemplateSchema.parse(request);
      const project = await createFromTemplateAsync(parsedRequest);
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
    setSelectedTemplate(null);
    onRequestClose?.();
  };

  // todo: this modal needs to be wider to match design
  return (
    <DialogModal
      hideActions={!selectedTemplate}
      actions={
        selectedTemplate ? (
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
        ) : undefined
      }
      onClose={cancel}
      closeId="addProjectCancel1"
      keepMounted={false}
      open={open}
      title={selectedTemplate ? "Project Name" : "Add Project"}
    >
      <Stack spacing={2} direction={"column"} sx={{ width: 512 }}>
        {selectedTemplate ? (
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
        ) : (
          <>
            <div>Select a project type</div>
            <List sx={{ maxHeight: 420, paddingTop: 0, overflowY: "auto" }}>
              {templates.map((template) => {
                return (
                  <ProjectTemplateListItem
                    key={template.id}
                    onClick={onTemplateItemClicked(template)}
                    template={template}
                  />
                );
              })}
            </List>
          </>
        )}
      </Stack>
    </DialogModal>
  );
}
