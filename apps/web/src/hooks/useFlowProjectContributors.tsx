import { useErrorModalContext } from "@/context/errorModals";
import { useFlowProjectContext } from "@/context/flowProject";
import { ProjectModalType } from "@/context/project";
import { useUserSessionContext } from "@/hooks/userSession";
import {
  useAddProjectApprovalMutation,
  useProjectApprovalsQuery,
  useUpdateProjectContributorsMutation,
} from "@/queries";
import { BucketedContributors, bucketContributors } from "@/util/misc";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  ContributorRole,
  ContributorSchema,
  FlowProjectSchema,
  ProjectApprovalResponseSchema,
  ProjectSchema,
} from "xylem";

export function useFlowProjectContributors({
  project,
}: {
  project: ProjectSchema | FlowProjectSchema | null | undefined;
}) {
  const { showErrorModal } = useErrorModalContext();
  const { user } = useUserSessionContext();
  const { canEdit, setActiveModal } = useFlowProjectContext();

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

  const editContributorsClicked = () => {
    setActiveModal(ProjectModalType.Share);
  };

  const [sortedContributors, setSortedContributors] = React.useState<
    BucketedContributors | undefined
  >(bucketContributors(project?.contributors));

  React.useEffect(() => {
    setSortedContributors(bucketContributors(project?.contributors));
  }, [project?.contributors]);

  const onContributorsChanged = React.useCallback(
    (role: ContributorRole, contributors: (ContributorSchema | null)[]) => {
      if (sortedContributors) {
        setSortedContributors((previous) => {
          const result = {
            ...previous!,
            [role]: contributors,
          };
          const unchangedContributorRoles = Object.values(ContributorRole).filter(
            (x) => x !== role,
          );
          unchangedContributorRoles.forEach((unchangedRole) => {
            const contributorsInOtherRole = result[unchangedRole];
            const matchingIndex = !contributorsInOtherRole
              ? -1
              : contributorsInOtherRole?.findIndex(
                  (x) =>
                    Boolean(x) &&
                    contributors.find((y) => Boolean(y) && y?.user?.id === x?.user?.id),
                );
            if (matchingIndex >= 0) {
              // check to see if trying to reassign the only Owner... block it
              if (
                unchangedRole === ContributorRole.Owner &&
                contributorsInOtherRole?.length === 1
              ) {
                showErrorModal("Cannot reassign the only Owner on the project.");
                // remove the match from the incoming changed collection
                const match = contributorsInOtherRole[matchingIndex];
                result[role]?.splice(
                  contributors.findIndex((x) => x?.user?.id === match?.user?.id),
                  1,
                  null,
                );
              } else {
                // remove the matched contributor from the current collection... reassign
                contributorsInOtherRole?.splice(matchingIndex, 1, null);
              }
            }
          });
          return result;
        });
      }
    },
    [showErrorModal],
  );

  const { isLoading: isUpdatingContributors, mutateAsync: updateContributorsAsync } =
    useUpdateProjectContributorsMutation();

  return {
    isUpdatingContributors,
    onContributorsChanged,
    setSortedContributors,
    sortedContributors,
    updateContributorsAsync,
    approvalsByUserId,
    canEdit,
    editContributorsClicked,
    isSubmittingAprroval,
    project,
    submitApprovalAsync,
    user,
  } as const;
}
