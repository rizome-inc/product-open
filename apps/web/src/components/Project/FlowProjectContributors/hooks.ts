import { useFlowProjectContext } from "@/context/flowProject";
import { ProjectModalType } from "@/context/project";
import { useUserSessionContext } from "@/hooks/userSession";
import { useAddProjectApprovalMutation, useProjectApprovalsQuery } from "@/queries";
import { bucketContributors } from "@/util/misc";
import { useEffect, useMemo, useState } from "react";
import { ProjectApprovalResponseSchema } from "xylem";

// fixme: redundant / deprecated

export function useFlowProjectContributors() {
  const { user } = useUserSessionContext();
  const { project, canEdit, setActiveModal } = useFlowProjectContext();

  const [approvalsByUserId, setApprovalsByUserId] = useState<
    Record<string, ProjectApprovalResponseSchema>
  >({});
  const { data: approvals } = useProjectApprovalsQuery({
    id: project?.id ?? 0, // fixme: need sensible defaults for not-yet-defined data
    enabled: Boolean(project?.publishedAt && project?.id),
  });

  // todo: the below seems a bit messy
  useEffect(() => {
    if (approvals) {
      setApprovalsByUserId(
        approvals.reduce<Record<string, ProjectApprovalResponseSchema>>((res, curr) => {
          res[curr.creatorId!] = curr;
          return res;
        }, {}),
      );
    }
  }, [approvals]);

  const { isLoading: isSubmittingAprroval, mutateAsync: submitApprovalAsync } =
    useAddProjectApprovalMutation();

  const sortedContributors = useMemo(() => {
    return bucketContributors(project?.contributors);
  }, [project?.contributors]);

  const editContributorsClicked = () => {
    setActiveModal(ProjectModalType.Share);
  };

  return {
    approvalsByUserId,
    canEdit,
    editContributorsClicked,
    isSubmittingAprroval,
    project,
    sortedContributors,
    submitApprovalAsync,
    user,
  } as const;
}
