import { useContextGuard } from "@/hooks/contextGuard";
import { useUserSessionContext } from "@/hooks/userSession";
import {
  useCompleteDiscussionMutation,
  useCreateDiscussionLinkedDocumentMutation,
  useDiscussionParticipantsQuery,
  useDiscussionQuery,
  useProjectQuery,
  useRemoveDiscussionLinkedDocumentMutation,
  useUpdateDiscussionLinkedDocumentMutation,
  useUpdateDiscussionMutation,
  useUpdateDiscussionParticipantsMutation,
} from "@/queries";
import * as React from "react";
import { ContributorRole, DiscussionSchema, FileAttachmentSchema } from "xylem";

export enum DiscussionActiveModalType {
  Unset,
  EditParticipants,
  MarkAsComplete,
}

export function useDiscussionContextController({
  projectId,
  discussionId,
}: {
  projectId: number;
  discussionId: number;
}) {
  const { user } = useUserSessionContext();
  const { isLoading: isLoadingProject, data: project } = useProjectQuery({
    id: projectId,
    enabled: Boolean(projectId && projectId > 0),
    include: {
      includeContent: false,
      includeContributors: true,
      includeDiscussions: false,
    },
  });
  const { isLoading: isLoadingDiscussion, data: discussion } = useDiscussionQuery({
    id: discussionId,
    enabled: Boolean(discussionId && discussionId > 0),
  });
  const { isLoading: isLoadingParticipants, data: participants } = useDiscussionParticipantsQuery({
    id: discussionId,
    enabled: Boolean(discussionId && discussionId > 0),
  });

  const [activeModal, setActiveModal] = React.useState<DiscussionActiveModalType>(
    DiscussionActiveModalType.Unset,
  );

  const currentContributor = project?.contributors?.find((x) => x.user?.id === user?.id);
  const canEdit =
    currentContributor &&
    currentContributor.role !== ContributorRole.ReadOnly &&
    !project?.publishedAt;

  return {
    activeModal,
    canEdit,
    discussion,
    isLoadingDiscussion,
    isLoadingParticipants,
    isLoadingProject,
    participants,
    project,
    setActiveModal,
  } as const;
}

export const DiscussionContext = React.createContext<ReturnType<
  typeof useDiscussionContextController
> | null>(null);

export const useDiscussionContext = () => useContextGuard(DiscussionContext, "DiscussionContext");

export function useDiscussionEditingContextController(discussion: DiscussionSchema | undefined) {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const [editableDiscussion, setEditableDiscussion] = React.useState<Partial<DiscussionSchema>>({});
  const [filesToAttach, setFilesToAttach] = React.useState<File[] | undefined>(undefined);
  const [fileAttachmentsToRemove, setFileAttachmentsToRemove] = React.useState<
    FileAttachmentSchema[] | undefined
  >(undefined);

  React.useEffect(() => {
    if (isEditing && discussion) {
      setEditableDiscussion({ ...discussion });
    } else {
      setEditableDiscussion({});
    }
    setFilesToAttach(undefined);
    setFileAttachmentsToRemove(undefined);
  }, [isEditing, discussion]);

  const setEditableValue = React.useCallback(
    <TKey extends keyof DiscussionSchema>(key: TKey, value: Partial<DiscussionSchema>[TKey]) => {
      setEditableDiscussion((v) => ({
        ...(v || {}),
        [key]: value,
      }));
    },
    [],
  );
  const getEditableValue = React.useCallback(
    <TKey extends keyof DiscussionSchema>(key: TKey) => {
      return (editableDiscussion || {})[key];
    },
    [editableDiscussion],
  );

  const { isLoading: isUpdatingDiscussion, mutateAsync: updateDiscussionAsync } =
    useUpdateDiscussionMutation();

  const saveEditsAsync = React.useCallback(async () => {
    if (discussion?.id && editableDiscussion) {
      const { name, outcome, topic } = editableDiscussion;
      // FIXME: handle bulk file attachment uploads and deletions here
      await updateDiscussionAsync({
        id: discussion?.id,
        request: {
          name,
          outcome: outcome ?? undefined,
          topic: topic ?? undefined,
        },
      });
    }
  }, [discussion?.id, editableDiscussion, updateDiscussionAsync]);

  const createLinkedDocumentMutation = useCreateDiscussionLinkedDocumentMutation();
  const removeLinkedDocumentMutation = useRemoveDiscussionLinkedDocumentMutation();
  const updateLinkedDocumentMutation = useUpdateDiscussionLinkedDocumentMutation();
  const updateParticipantsMutation = useUpdateDiscussionParticipantsMutation();
  const completeDiscussionMutation = useCompleteDiscussionMutation();

  return {
    completeDiscussionMutation,
    createLinkedDocumentMutation,
    getEditableValue,
    isEditing,
    isUpdatingDiscussion,
    removeLinkedDocumentMutation,
    saveEditsAsync,
    setEditableValue,
    setIsEditing,
    updateLinkedDocumentMutation,
    updateParticipantsMutation,
    setFilesToAttach,
    filesToAttach,
    setFileAttachmentsToRemove,
    fileAttachmentsToRemove,
  } as const;
}

export const DiscussionEditingContext = React.createContext<ReturnType<
  typeof useDiscussionEditingContextController
> | null>(null);

export const useDiscussionEditingContext = () =>
  useContextGuard(DiscussionEditingContext, "DiscussionEditingContext");
