import {
  BasePageActionButton,
  BasePageLoadingActionButton,
} from "@/components/BasePageActionButton";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { BasePageLayout } from "@/layouts/BasePageLayout";
import { prettifyJsonString } from "@/util/misc";
import { Editor, OnMount, OnValidate, useMonaco } from "@monaco-editor/react";
import Box from "@mui/material/Box";
import { editor } from "monaco-editor";
import { useRouter } from "next/router";
import * as React from "react";
import { TemplateSchema, templateSchema } from "xylem";
import { useProjectTemplateEditing } from "../../../context/projectTemplate";
import EmptyTemplateJson from "./emptyTemplate.json";
import TemplateSchemaJson from "./templateSchema.json";

const DefaultEditorOptions: editor.IStandaloneEditorConstructionOptions = {
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
};

const formatJsonStringRep = (template?: TemplateSchema) => {
  if (!template) {
    return "";
  }
  const input: Partial<TemplateSchema> = { ...template };
  delete input.id;
  delete input.createdAt;
  delete input.creatorId;
  delete input.contentVersion;
  delete input.updatedAt;

  return prettifyJsonString(JSON.stringify(input));
};

function EditTemplate() {
  const { showErrorModal } = useErrorModalContext();
  const router = useRouter();
  const { toastSuccess } = useToaster();

  const monaco = useMonaco();
  React.useEffect(() => {
    if (monaco) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: "",
            fileMatch: ["*"],
            schema: TemplateSchemaJson,
          },
        ],
      });
    }
  }, [monaco]);

  let templateId = -1; // fixme: this is a bad way to work around "template may not be defined" errors
  const creatingNewTemplate =
    typeof router.query?.id === "string" ? router.query.id.toLocaleLowerCase() === "create" : false;
  const queryByIdEnabled = Boolean(!creatingNewTemplate && router.query.id);

  if (queryByIdEnabled) {
    try {
      templateId = parseInt(router.query.id as string, 10);
    } catch (error) {
      // TODO: log this error
    }
  }

  const { template, isLoading, updateTemplateAsync, createTemplateAsync } =
    useProjectTemplateEditing({
      templateId,
      queryByIdEnabled,
    });

  const [jsonStringRep, setJsonStringRep] = React.useState<string>(
    formatJsonStringRep(creatingNewTemplate ? (EmptyTemplateJson as TemplateSchema) : template),
  );
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);
  const [editorErrors, setEditorErrors] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    setJsonStringRep(
      formatJsonStringRep(creatingNewTemplate ? (EmptyTemplateJson as TemplateSchema) : template),
    );
  }, [creatingNewTemplate, template]);

  const onEditorMount: OnMount = (ref) => {
    editorRef.current = ref;
  };

  const onEditorValidate: OnValidate = (markers) => {
    const errorMessages = markers?.map(
      ({ startLineNumber, message }) => `line ${startLineNumber}: ${message}`,
    );
    setEditorErrors(errorMessages?.length > 0 ? errorMessages : null);
  };

  const saveTemplate = async () => {
    if (editorErrors && editorErrors.length > 0) {
      showErrorModal(editorErrors);
      return;
    }
    try {
      const templateToSave: TemplateSchema = {
        ...(template || {}),
        ...JSON.parse(editorRef.current?.getValue() || "{}"),
        contentVersion: template?.contentVersion || 1,
        type: "project",
      };
      templateSchema.parse(templateToSave);

      if (creatingNewTemplate) {
        await createTemplateAsync({ template: templateToSave });
      } else {
        await updateTemplateAsync({
          id: templateId,
          template: templateToSave,
        });
      }
      toastSuccess("Template saved.");
      router.replace("/templates");
    } catch (error) {
      showErrorModal(error);
    }
  };

  const [showCancelConfirmation, setShowCancelConfirmation] = React.useState<boolean>(false);

  const onCancelConfirmationModalRequestClose = (didConfrim: boolean) => {
    if (didConfrim) {
      router.push("/templates");
      return;
    }

    setShowCancelConfirmation(false);
  };

  const onCancelClicked = () => {
    if (creatingNewTemplate || (jsonStringRep && jsonStringRep !== editorRef.current?.getValue())) {
      setShowCancelConfirmation(true);
      return;
    }
    router.push("/templates");
  };

  const renderBreadcrumbPathComponent = (_: string, index: number, pathComps: string[]) => {
    if (index === pathComps.length - 1) {
      return creatingNewTemplate ? "New Template" : `${template?.name || ""}`;
    }
  };

  return (
    <BasePageLayout
      title={creatingNewTemplate ? "New Template" : `Template: ${template?.name || ""}`}
      onRenderBreadcrumbPathComponent={renderBreadcrumbPathComponent}
      actions={
        <>
          <BasePageActionButton
            id="updateTemplateCancel"
            disabled={isLoading}
            onClick={onCancelClicked}
            variant="outlined"
          >
            Cancel
          </BasePageActionButton>
          <BasePageLoadingActionButton
            id="updateTemplateFinish"
            loading={isLoading}
            onClick={saveTemplate}
            variant="contained"
          >
            Save
          </BasePageLoadingActionButton>
        </>
      }
      sx={() => ({
        height: "100%",
      })}
    >
      <Box
        sx={(theme) => ({
          p: 1,
          border: `2px solid #777`,
          borderRadius: `${theme.shape.borderRadius}px`,
          height: "calc(100% - 176px)",
          position: "absolute",
          bottom: "24px",
          left: "32px",
          width: "calc(100% - 72px)",
        })}
      >
        <Editor
          language="json"
          loading={<LoadingSpinner absoluteCenterPosition={true} />}
          onMount={onEditorMount}
          onValidate={onEditorValidate}
          options={DefaultEditorOptions}
          value={jsonStringRep}
          width={"100%"}
          height={"100%"}
        />
      </Box>
      <ConfirmationModal
        message="Are you sure you want to discard these changes?"
        confirmationCta="Discard"
        closeText="Keep editing"
        onRequestClose={onCancelConfirmationModalRequestClose}
        open={showCancelConfirmation}
        title={`Discard: ${creatingNewTemplate ? "Template" : "Changes"}`}
      />
    </BasePageLayout>
  );
}

export default EditTemplate;
