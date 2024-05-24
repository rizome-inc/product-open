import { BASE_URL } from "@/api";
import {
  modalBodyStyle,
  modalFooterStyle,
  modalHeaderStyle,
  modalStyle,
} from "@/components/CardModal/style.sx";
import { InputField } from "@/components/InputField";
import { CalloutMessage } from "@/components/messages/CalloutMessage";
import { CalloutMessageStatus } from "@/components/messages/CalloutMessage/types";
import { useToaster } from "@/context/useToaster";
import supabaseClient from "@/lib/supabaseClient";
import { useLogger } from "@/types";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Divider, Modal, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

export function SignInModal() {
  const logger = useLogger("SignIn");
  const router = useRouter();
  const { toastError } = useToaster();

  const [email, setEmail] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [showingSuccessMessage, setShowingSuccessMessage] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onSignInClicked = () => {
    setIsLoading(true);
    supabaseClient.auth
      .signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${BASE_URL}/projects`,
        },
      })
      .then(({ error }) => {
        // console.log(data, error)
        if (error) {
          logger.error("RequestLoginLinkError", { error });
          toastError("Email does not exist. Please create an account");
        } else {
          setShowingSuccessMessage(true);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        logger.error("RequestLoginLinkError", { error });
        const message = error?.message;
        if (message) {
          toastError(message);
        }
        setIsLoading(false);
      });
  };

  const onInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const InputBody = (
    <>
      <Box sx={modalHeaderStyle}>
        <Typography variant="h2">Sign in</Typography>
      </Box>
      <Divider />
      <Box sx={modalBodyStyle}>
        <InputField
          disabled={isLoading}
          error={errorMessage}
          id="signin-email"
          label="Email Address"
          name="email"
          onChange={onInputChanged}
          onFocus={() => setErrorMessage("")}
          value={email}
        />
      </Box>
      <Divider />
      <Box sx={modalFooterStyle}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <LoadingButton loading={isLoading} onClick={onSignInClicked} variant="contained">
            <span>Send magic link</span>
          </LoadingButton>
          <Button variant="text" className="tertiary" onClick={() => router.push("/signup")}>
            Create an account
          </Button>
        </Stack>
      </Box>
    </>
  );

  const SuccessBody = (
    <>
      <Box sx={modalBodyStyle}>
        <CalloutMessage status={CalloutMessageStatus.Success} sx={{ width: "100%" }}>
          <Box component="span" sx={{ flexGrow: 1 }}>
            An email with a login link was sent to:{" "}
            <Box component="span" sx={{ color: "text.primary" }}>
              {email}
            </Box>
            .
            <br />
            <span>To continue, click the link in the email.</span>
          </Box>
        </CalloutMessage>
      </Box>
    </>
  );

  return (
    <Modal open={true}>
      <Box sx={modalStyle}>{showingSuccessMessage ? SuccessBody : InputBody}</Box>
    </Modal>
  );
}
