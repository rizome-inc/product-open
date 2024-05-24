import { LiveblocksProvider } from "@/liveblocks.config";
import { Paper } from "@mui/material";
import * as React from "react";
import AppHeader from "../components/AppHeader";

// todo: simplify where providers are located
function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <LiveblocksProvider>
      <AppHeader />
      <Paper
        square={true}
        elevation={0}
        sx={() => ({
          // TODO: change this to use theme value
          minHeight: "calc(100% - 45px)",
          backgroundColor: "#fafafa",
          paddingBottom: "24px",
        })}
      >
        {children}
      </Paper>
    </LiveblocksProvider>
  );
}

export const getAppLayout = (page: React.ReactNode): React.ReactNode => (
  <AppLayout>{page}</AppLayout>
);

export default AppLayout;
