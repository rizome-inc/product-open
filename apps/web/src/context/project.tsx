import { useContextGuard } from "@/hooks/contextGuard";
import { useUserSessionContext } from "@/hooks/userSession";
import { uploadFile } from "@/lib/supabaseClient";
import {
  useProjectDiscussionsQuery,
  useProjectQuery,
  useUpdateProjectContentMutation,
} from "@/queries";
import { useGetSignedUploadUrlMutation } from "@/queries/project/useGetSignedUploadUrlMutation";
import * as React from "react";
import { ContributorRole, ProjectSchema, WorkTrackingSchema } from "xylem";

export enum ProjectModalType {
  Unset,
  AddDiscussion,
  Publish,
  Rename,
  Share,
}

export function useProjectContextController({ id }: { id: number }) {
  const { user } = useUserSessionContext();
  const [isLoading, setIsLoading] = React.useState<boolean | undefined>();
  const [project, setProject] = React.useState<ProjectSchema | undefined>();
  const projectQueryResult = useProjectQuery({
    id,
    enabled: Boolean(id && id > 0),
    include: {
      includeContent: true,
      includeContributors: true,
      includeDiscussions: false,
    },
  });

  React.useEffect(() => {
    setIsLoading(projectQueryResult.isLoading);
    setProject(projectQueryResult.data);
  }, [projectQueryResult.isLoading, projectQueryResult.data]);

  const {
    isLoading: isLoadingDiscussions,
    data: discussions,
    refetch,
  } = useProjectDiscussionsQuery({
    id,
    enabled: Boolean(id && id > 0),
  });
  const [activeModal, setActiveModal] = React.useState<ProjectModalType>(ProjectModalType.Unset);

  const currentContributor = project?.contributors?.find((x) => x.user?.id === user?.id);
  const canEdit =
    currentContributor &&
    currentContributor.role !== ContributorRole.ReadOnly &&
    !project?.publishedAt;

  return {
    activeModal,
    canEdit,
    discussions,
    isLoading,
    isLoadingDiscussions,
    project,
    setActiveModal,
    refetchDiscussionsData: refetch,
  } as const;
}

export const ProjectContext = React.createContext<ReturnType<
  typeof useProjectContextController
> | null>(null);

export const useProjectContext = () => useContextGuard(ProjectContext, "ProjectContext");

export function useProjectEditingContextController(project: ProjectSchema | undefined) {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  /**
   * Notes
   * - It looks like FormField is only referenced in useUpdateProjectContentMutation to identify whether a field has an attachment.
   *   It comes from project anyway. What is actually used for tracking is Record<string, any>
   * - useUpdateProjectContentMutation & the backend code saves every field, so tracking "Content" as a whole should be sufficient
   *
   * dev note: leaving some comments temporarily in case they're relevant, but I changed a lot during the xylem refactor.
   * I think immer will still make this easier to manage
   */

  // v1: Changes stored as the map, but without refs -- q: is the update to useEffect below sufficient to fix the change reload issue?
  // v2: Changes stored as an immer reducer on Project Content, including work tracking
  // v3: Undo/redo logic
  // v4: (requires xylem) Simplified reducer and patch logic
  const [projectEdits, setProjectEdits] = React.useState<Map<string, any>>(new Map<string, any>());
  // Getter and setter use callbacks to prevent full rerendering of the project

  // console.log(projectEdits)

  const setValueForField = React.useCallback(
    (formFieldId: string, value: any) => setProjectEdits((e) => e.set(formFieldId, value)),
    [],
  );
  const getValueForField = React.useCallback(
    (formFieldId: string) => projectEdits.get(formFieldId),
    [projectEdits],
  );

  const [workTracking, setWorkTracking] = React.useState<WorkTrackingSchema>({});

  React.useEffect(() => {
    if (project) {
      setWorkTracking({
        workTrackingName: project.workTrackingName,
        workTrackingUrl: project.workTrackingUrl,
      });
      setProjectEdits(
        project.content.categories
          .flatMap((x) => x.fields)
          .reduce((acc, x) => {
            if (x.id) {
              return acc.set(x.id, x.value);
            }
            return acc;
          }, new Map<string, any>()),
      );
    }
  }, [isEditing, project]); // reset edits if isEditing status changes

  const { isLoading: isUpdatingProjectContent, mutateAsync } = useUpdateProjectContentMutation();

  const getSignedUploadUrlMutation = useGetSignedUploadUrlMutation();

  const updateProjectContentAsync = React.useCallback(async () => {
    if (project?.id) {
      // Upload files to Supabase if present
      const fileEntries: [string, File][] = Array.from(projectEdits.entries()).filter(
        (kv) => kv[1] instanceof File,
      );
      for await (const [id, file] of fileEntries) {
        // fixme(performance): should this happen when project is loaded? upload links only last a certain amount of time though. skips several hops
        const fileAttachment = await getSignedUploadUrlMutation.mutateAsync({
          projectId: project.id,
          fileName: file.name,
        });
        await uploadFile(file, fileAttachment);
        const { uploadAuthToken, uploadUrl, ...rest } = fileAttachment;
        projectEdits.set(id, rest);
        // setValueForField(id, rest);
      }
      // fixme: rework how updates are applied (likely makes sense for it to be more of a BE concern)
      const categories = project.content.categories.map((c) => {
        const { name, description, fields } = c;
        return {
          name,
          description,
          fields: fields.map((f) => {
            const { id, value, ...rest } = f;
            return {
              id,
              value: projectEdits.has(id!) ? projectEdits.get(id!) : value,
              ...rest,
            };
          }),
        };
      });
      return mutateAsync({ id: project.id, content: { categories }, workTracking });
    }
  }, [
    getSignedUploadUrlMutation,
    mutateAsync,
    project?.content.categories,
    project?.id,
    projectEdits,
    workTracking,
  ]);

  return {
    isEditing,
    isUpdatingProjectContent,
    setIsEditing,
    setWorkTracking,
    updateProjectContentAsync,
    workTracking,
    projectEdits,
    setValueForField,
    getValueForField,
    isSaving,
    setIsSaving,
  } as const;
}

export const ProjectEditingContext = React.createContext<ReturnType<
  typeof useProjectEditingContextController
> | null>(null);

export const useProjectEditingContext = () =>
  useContextGuard(ProjectEditingContext, "ProjectEditingContext");
