import { useContextGuard } from "@/hooks/contextGuard";
import * as React from "react";

export type PendoScriptContext = {
  isLoaded?: boolean;
};

export const PendoContext = React.createContext<PendoScriptContext>({
  isLoaded: false,
});

export const usePendoContext = () => useContextGuard(PendoContext, "PendoContext");
