import {
  modalBodyStyle,
  modalFooterStyle,
  modalHeaderStyle,
  modalStyle,
} from "@/components/CardModal/style.sx";
import { InputField } from "@/components/InputField";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { CalloutMessage } from "@/components/messages/CalloutMessage";
import { CalloutMessageStatus } from "@/components/messages/CalloutMessage/types";
import { useErrorModalContext } from "@/context/errorModals";
import { getPublicLayout } from "@/layouts/PublicLayout";
import { useSignUpMutation } from "@/queries";
import { useLogger } from "@/types/logger";
import { Box, Button, Divider, Modal, Stack, Typography } from "@mui/material";
import { NextLayoutComponentType } from "next";
import { useRouter } from "next/router";
import * as React from "react";

// todo: login and signup pages are like 90% the same. rewrite for consistency
function SignUp() {
  const logger = useLogger("SignUp");
  const { showErrorModal } = useErrorModalContext();

  const { isLoading, mutateAsync: createUserAndOrgAsync } = useSignUpMutation();

  const router = useRouter();

  const [email, setEmail] = React.useState<string>("");
  const [organizationName, setOrganizationName] = React.useState<string>("");
  const [showingSuccessMessage, setShowingSuccessMessage] = React.useState<boolean>(false);

  const resetInput = () => {
    setShowingSuccessMessage(false);
    setEmail("");
    setOrganizationName("");
  };

  const onInputChanged =
    (id: string) =>
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = target;
      if (id === "email") {
        setEmail(value);
      } else if (id === "org") {
        setOrganizationName(value);
      }
    };

  const onSignUpClicked = async () => {
    try {
      await createUserAndOrgAsync({
        email,
        organizationName,
      });
      setShowingSuccessMessage(true);
    } catch (error: any) {
      logger.error("SignUpError", { error });
      showErrorModal(error);
    }
  };

  const InputBody = (
    <>
      <Box sx={modalHeaderStyle}>
        <Typography variant="h2">Sign up</Typography>
      </Box>
      <Divider />
      <Box sx={modalBodyStyle}>
        <Stack direction={"column"} spacing={2}>
          <InputField
            disabled={isLoading}
            id="email"
            label="Email Address"
            name="email"
            onChange={onInputChanged("email")}
            value={email}
          />
          <InputField
            disabled={isLoading}
            id="org"
            label="Organization Name"
            name="org"
            onChange={onInputChanged("org")}
            value={organizationName}
          />
        </Stack>
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
          <Stack direction="row" spacing={2}>
            <Button disabled={isLoading} onClick={resetInput} variant="outlined">
              Cancel
            </Button>
            <LoadingActionButton loading={isLoading} onClick={onSignUpClicked} variant="contained">
              <span>Try Rizome</span>
            </LoadingActionButton>
          </Stack>
          <Button variant="text" className="tertiary" onClick={() => router.push("/signin")}>
            Already have an account?
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
            An invitation has been sent to:{" "}
            <Typography component="b" sx={{ fontWeight: 700 }}>
              {email}
            </Typography>
            .
            <br />
            <span>To continue, click the link in the email.</span>
          </Box>
        </CalloutMessage>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "#00000080",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Modal open={true}>
        <Box sx={modalStyle}>{showingSuccessMessage ? SuccessBody : InputBody}</Box>
      </Modal>
    </Box>
  );
}

(SignUp as NextLayoutComponentType).getLayout = getPublicLayout;

export default SignUp;
