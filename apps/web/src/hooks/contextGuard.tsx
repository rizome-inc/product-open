import * as React from "react";

export function useContextGuard<TContext = any>(context: React.Context<TContext>, name: string) {
  const ctx = React.useContext(context);
  if (!ctx) {
    throw new Error(`Component requires the use context \"${name}\".`);
  }
  return ctx;
}
