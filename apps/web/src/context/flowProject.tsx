import useLiveblocksStore from "@/flow/store/useLiveblocksStore";
import { useContextGuard } from "@/hooks/contextGuard";
import { useUserSessionContext } from "@/hooks/userSession";
import { useFlowProjectQuery } from "@/queries/project/useFlowProjectQuery";
import { useUpdateFlowProjectMutation } from "@/queries/project/useUpdateFlowProjectMutation";
import * as React from "react";
import { ContributorRole, FlowProjectSchema, WorkTrackingSchema } from "xylem";

export enum ProjectModalType {
  Unset,
  AddDiscussion,
  Publish,
  Rename,
  Share,
}

export function useFlowProjectContextController({ id }: { id: number }) {
  const { user } = useUserSessionContext();
  const [isLoading, setIsLoading] = React.useState<boolean | undefined>();
  const [project, setProject] = React.useState<FlowProjectSchema | undefined>();
  const projectQueryResult = useFlowProjectQuery({
    id,
    enabled: Boolean(id && id > 0),
  });

  React.useEffect(() => {
    setIsLoading(projectQueryResult.isLoading);
    setProject(projectQueryResult.data);
  }, [projectQueryResult.isLoading, projectQueryResult.data]);

  const [activeModal, setActiveModal] = React.useState<ProjectModalType>(ProjectModalType.Unset);

  const currentContributor = project?.contributors?.find((x) => x.user?.id === user?.id);
  const canEdit =
    currentContributor &&
    currentContributor.role !== ContributorRole.ReadOnly &&
    !project?.publishedAt;

  return {
    activeModal,
    canEdit,
    isLoading,
    project,
    setActiveModal,
  } as const;
}

export const FlowProjectContext = React.createContext<ReturnType<
  typeof useFlowProjectContextController
> | null>(null);

export const useFlowProjectContext = () =>
  useContextGuard(FlowProjectContext, "FlowProjectContext");

export function useFlowProjectEditingContextController(project: FlowProjectSchema | undefined) {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isExampleProject, setIsExampleProject] = React.useState<boolean>(
    Boolean(project?.example),
  );

  const [workTracking, setWorkTracking] = React.useState<WorkTrackingSchema>({});

  React.useEffect(() => {
    if (project) {
      setWorkTracking({
        workTrackingName: project.workTrackingName,
        workTrackingUrl: project.workTrackingUrl,
      });
      setIsExampleProject(Boolean(project?.example));
    }
  }, [isEditing, project]); // reset edits if isEditing status changes

  const liveblocksStore = useLiveblocksStore(isExampleProject);

  const { isLoading: isUpdatingProject, mutateAsync } = useUpdateFlowProjectMutation();

  const updateProjectContentAsync = React.useCallback(async () => {
    if (project?.id) {
      return mutateAsync({ id: project.id, workTracking });
    }
  }, [mutateAsync, project?.id, workTracking]);

  return {
    isEditing,
    isUpdatingProjectContent: isUpdatingProject,
    setIsEditing,
    setWorkTracking,
    updateProjectContentAsync,
    workTracking,
    isSaving,
    setIsSaving,
    liveblocksStore,
  } as const;
}

export const FlowProjectEditingContext = React.createContext<ReturnType<
  typeof useFlowProjectEditingContextController
> | null>(null);

export const useFlowProjectEditingContext = () =>
  useContextGuard(FlowProjectEditingContext, "FlowProjectEditingContext");
