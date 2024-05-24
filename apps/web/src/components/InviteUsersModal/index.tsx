import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { useInviteUsersMutation } from "@/queries";
import { LoadingButton } from "@mui/lab";
import Button from "@mui/material/Button";
import * as React from "react";
import { UserRole, UserSchema } from "xylem";
import { z } from "zod";
import { DialogModal } from "../DialogModal";
import { EmailTokenField } from "../EmailTokenField";

export type InviteUsersModal = {
  onRequestClose: (usersInvited?: UserSchema[]) => void;
  open: boolean;
};

export function InviteUsersModal({ open, onRequestClose }: InviteUsersModal) {
  const { mutateAsync: inviteUsersAsync, isLoading } = useInviteUsersMutation();
  const { toastSuccess } = useToaster();
  const { showErrorModal } = useErrorModalContext();

  const [emailAddresses, setEmailAddresses] = React.useState<string[]>([]);

  const close = () => {
    setEmailAddresses([]);
    onRequestClose();
  };

  const onInviteClicked = async () => {
    try {
      const count = emailAddresses.length;
      if (count === 0) {
        close();
        return;
      }

      z.array(z.string().email()).parse(emailAddresses);
      const users = await inviteUsersAsync({
        roles: [UserRole.User],
        users: emailAddresses.map((x) => ({
          email: x,
        })),
      });

      toastSuccess(
        `Invitation${count > 1 ? "s" : ""} sent to ${count} user${count > 1 ? "s" : ""}`,
      );
      setEmailAddresses([]);
      onRequestClose(users);
    } catch (error) {
      showErrorModal(error);
    }
  };

  return (
    <DialogModal
      actions={
        <>
          <Button id="inviteUserCancel1" variant="outlined" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            id="inviteUserFinish"
            disabled={isLoading}
            variant="contained"
            onClick={onInviteClicked}
          >
            Send Invitations
          </LoadingButton>
        </>
      }
      onClose={close}
      closeId="inviteUserCancel2"
      keepMounted={false}
      open={open}
      title={"Invite Users"}
    >
      <EmailTokenField
        emailAddresses={emailAddresses}
        onEmailAddressesChanged={setEmailAddresses}
        sx={{ width: { xs: "100%", sm: 500 } }}
      />
    </DialogModal>
  );
}
