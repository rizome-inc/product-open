import {
  useCreateProjectTemplateMutation,
  useProjectTemplateQuery,
  useProjectTemplateUpdateMutation,
} from "@/queries";

export function useProjectTemplateEditing(
  {
    templateId,
    queryByIdEnabled,
  }: {
    templateId: number;
    queryByIdEnabled?: boolean;
  } = { templateId: -1 },
) {
  const { isFetching, data: template } = useProjectTemplateQuery(templateId, {
    enabled: queryByIdEnabled && templateId > 0,
    refetchOnWindowFocus: false,
  });
  const { isLoading: isUpdating, mutateAsync: updateTemplateAsync } =
    useProjectTemplateUpdateMutation();
  const { isLoading: isCreating, mutateAsync: createTemplateAsync } =
    useCreateProjectTemplateMutation();

  const isLoading = isFetching || isUpdating || isCreating;

  return {
    createTemplateAsync,
    isCreating,
    isFetching,
    isLoading,
    isUpdating,
    template,
    updateTemplateAsync,
  } as const;
}
