import { useContextGuard } from "@/hooks/contextGuard";
import { ErrorLike, ErrorModalContent, ErrorModalData } from "@/types";
import * as React from "react";

type ShowErrorModalContent = { content: ErrorModalContent; title?: string };
export function useErrorModalContextController() {
  const [errorModals, setErrorModals] = React.useState<ErrorModalData[]>([]);
  const [nextModalId, setNextModalId] = React.useState(1);

  const showErrorModal = React.useCallback(
    (data: ErrorModalContent | ErrorLike | unknown) => {
      return new Promise<void>((resolve) => {
        const id = nextModalId;
        setNextModalId((prevId) => prevId + 1);

        let content: any = undefined;
        let title: string | undefined = undefined;
        if (typeof data === "object" && (data as any)?.hasOwnPropery?.("content")) {
          const showModalContent = data as any as ShowErrorModalContent;
          content = showModalContent.content;
          title = showModalContent.title;
        } else {
          content = data as ErrorLike;
        }
        setErrorModals((prevModals) => [...prevModals, { id, content, resolve, title }]);
      });
    },
    [nextModalId],
  );

  const onClose = React.useCallback((modalId: number) => {
    setErrorModals((prevModals) => {
      const modal = prevModals.find((m) => m.id === modalId);
      if (modal) {
        modal.resolve();
      }
      return prevModals.filter((m) => m.id !== modalId);
    });
  }, []);

  const closeAllModals = React.useCallback(() => {
    errorModals?.forEach((x) => x?.resolve?.());
    setErrorModals([]);
  }, [errorModals]);

  return { closeAllModals, errorModals, onClose, showErrorModal } as const;
}

export const ErrorModalContext = React.createContext<
  ReturnType<typeof useErrorModalContextController> | undefined
>(undefined);

export const useErrorModalContext = () => useContextGuard(ErrorModalContext, "ErrorModalContext");
