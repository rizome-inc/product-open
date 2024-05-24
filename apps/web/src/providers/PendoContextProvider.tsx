import { PendoContext } from "@/context/pendo";
import { useUserSessionContext } from "@/hooks/userSession";
import Script from "next/script";
import * as React from "react";

export function PendoContextProvider({ children }: React.PropsWithChildren) {
  const { user } = useUserSessionContext();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const onPendoScriptLoaded = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (
      isLoaded &&
      user?.id &&
      user?.organization?.id &&
      process.env.NODE_ENV !== "development" &&
      process.env.NODE_ENV !== "test"
    ) {
      pendo.initialize({
        visitor: {
          id: `${user.id}`,
          email: user.email || "",
          full_name: `${user.firstName} ${user.lastName}`,
        },
        account: {
          id: `${user.organization.id}`,
          name: user.organization.name || "",
        },
      });
    }
  }, [isLoaded, user]);

  const context = React.useMemo(() => ({ isLoaded }), [isLoaded]);

  return (
    <PendoContext.Provider value={context}>
      <Script
        async={true}
        id="pendo_script"
        src={"https://cdn.pendo.io/agent/static/5cef524f-32bb-4b86-4a5a-78012d8b13ee/pendo.js"}
        onLoad={onPendoScriptLoaded}
        strategy="afterInteractive"
      />
      {children}
    </PendoContext.Provider>
  );
}
