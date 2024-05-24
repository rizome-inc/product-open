import { CalloutMessage } from "@/components/messages/CalloutMessage";
import { UserSessionContextProvider } from "@/hooks/userSession";
import { getAppLayout } from "@/layouts/AppLayout";
import { ErrorModalProvider } from "@/providers/ErrorModalProvider";
import { PendoContextProvider } from "@/providers/PendoContextProvider";
import { WindowVisibilityProvider } from "@/providers/WindowVisibilityContextProvider";
import { queryClient } from "@/queries";
import "@/styles/globals.css";
import "@/styles/liveblocks.css";

import { Theme } from "@/styles/theme";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import { enableMapSet, enablePatches } from "immer";
import { NextLayoutComponentType } from "next";
import type { AppProps } from "next/app";
import { SnackbarProvider } from "notistack";

// Entrypoint initializations //
// Configure Immer to track all changes to draft objects
enablePatches();
// Configure Immer to enable support for Map and Set collections
enableMapSet();

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = (Component as NextLayoutComponentType).getLayout || getAppLayout;

  return (
    <ThemeProvider theme={Theme}>
      <CssBaseline />
      <WindowVisibilityProvider>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <SnackbarProvider
                anchorOrigin={{
                  horizontal: "right",
                  vertical: "top",
                }}
                Components={{
                  error: CalloutMessage,
                  success: CalloutMessage,
                  warning: CalloutMessage,
                }}
                preventDuplicate={true}
                // autoHideDuration={3000}
              >
                <ErrorModalProvider>
                  <UserSessionContextProvider>
                    <PendoContextProvider>
                      <div id="_app-root" className="overflow-x-hidden hideScrollbar">
                        <Box
                          sx={{
                            mr: 0,
                            mt: 6,
                            position: "absolute",
                            zIndex: 50,
                          }}
                        ></Box>
                        {getLayout(<Component {...pageProps} />)}
                      </div>
                    </PendoContextProvider>
                  </UserSessionContextProvider>
                </ErrorModalProvider>
              </SnackbarProvider>
            </LocalizationProvider>
          </Hydrate>
        </QueryClientProvider>
      </WindowVisibilityProvider>
    </ThemeProvider>
  );
}
