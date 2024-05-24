import { useContextGuard } from "@/hooks/contextGuard";
import * as React from "react";

// fixme: do we use this for anything?

export interface IWindowVisibilityContext {
  isWindowVisible: boolean;
}

export const WindowVisibilityContext = React.createContext<IWindowVisibilityContext>({
  isWindowVisible: false,
});

export const useWindowVisibilityContext = () =>
  useContextGuard(WindowVisibilityContext, "WindowVisibilityContext");

export function WindowVisibilityProvider({ children }: React.PropsWithChildren) {
  const [isWindowVisible, setIsWindowVisible] = React.useState<boolean>(
    typeof window !== "undefined" ? window?.document?.hasFocus() : false,
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.onfocus = () => {
        setIsWindowVisible(true);
      };

      window.onblur = () => {
        setIsWindowVisible(false);
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        window.onblur = null;
        window.onfocus = null;
      }
    };
  }, []);

  return (
    <WindowVisibilityContext.Provider value={{ isWindowVisible }}>
      {children}
    </WindowVisibilityContext.Provider>
  );
}
