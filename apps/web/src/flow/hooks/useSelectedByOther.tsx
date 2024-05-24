import { useOthers } from "@/liveblocks.config";
import { useCallback } from "react";

export function useNodeSelections() {
  const users = useOthers();

  const selectionStatus = useCallback(
    (nodeId: string | undefined, userId: string): { selected: boolean; editorName?: string } => {
      if (!nodeId) {
        return {
          selected: false,
          editorName: undefined,
        };
      }
      const editors = users.filter(
        ({ id, presence }) => presence.selectedNodeId === nodeId && id !== userId,
      );
      return {
        selected: editors.length > 0,
        editorName: editors.length > 0 ? editors[0].info.name : undefined,
      };
    },
    [users],
  );

  return {
    // users,
    selectionStatus,
  } as const;
}
