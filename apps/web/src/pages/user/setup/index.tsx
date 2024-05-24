import CardModal from "@/components/CardModal";
import { InputField } from "@/components/InputField";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useErrorModalContext } from "@/context/errorModals";
import { useToaster } from "@/context/useToaster";
import { useUserSessionContext } from "@/hooks/userSession";
import { getPublicLayout } from "@/layouts/PublicLayout";
import { useUpdateUserMutation } from "@/queries";
import { useLogger } from "@/types";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { NextLayoutComponentType } from "next";
import { useRouter } from "next/router";
import React from "react";

function UserSetup() {
  const { showErrorModal } = useErrorModalContext();
  const logger = useLogger("UserSetup");
  const router = useRouter();
  const { user, isLoadingUser, session } = useUserSessionContext();
  const [firstName, setFirstName] = React.useState<string>(user?.firstName || "");
  const [lastName, setLastName] = React.useState<string>(user?.lastName || "");
  useToaster();

  React.useEffect(() => {
    if (!isLoadingUser && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [isLoadingUser, user]);

  const { mutateAsync: updateUserAsync, isLoading: isUpdatingUser } = useUpdateUserMutation();
  const isLoading = isLoadingUser || isUpdatingUser;

  const onSignInClicked = async () => {
    try {
      if (user?.id) {
        if (firstName.length < 1 || lastName.length < 1) {
          throw new Error("First name and last name must be at least 1 character");
        }
        await updateUserAsync({
          id: user.id,
          user: {
            firstName,
            lastName,
            supabaseId: session?.user.id,
          },
        });
        // use router.replace to prevent navigating back to the token page
        const nextPath = router.query["next"]
          ? Array.isArray(router.query["next"])
            ? router.query["next"][0]
            : router.query["next"]
          : "/projects";
        router.replace(nextPath);
      }
    } catch (error) {
      logger.error("Update user error", { error });
      showErrorModal(error);
    }
  };

  const onRenderFooter = () => {
    return (
      <Stack direction="row" spacing={2}>
        <Button disabled={isLoading} onClick={onSignInClicked} variant="contained">
          {isLoading ? <LoadingSpinner size={25} /> : "Continue Signing In"}
        </Button>
      </Stack>
    );
  };

  return (
    <div className="w-auto h-screen bg-[#00000080] flex justify-center items-center">
      <CardModal open={true} header="Welcome to Rizome!" footer={onRenderFooter()}>
        <div className="relative">
          <p className="font-['Helvetica'] mt-[0px] font-[400] text-[14px] text-[#333333] leading-[21px]">
            Rizome is a space to collaborate on data science projects
          </p>
          <p className="font-['Helvetica'] mt-[12px] mb-[25px] font-[400] text-[14px] text-[#333333] leading-[21px]">
            Whether you are a data scientist or someone who works with them, you can plan projects,
            discuss decisions, and share work in progress
          </p>
          <Stack direction="column" spacing={1}>
            <InputField
              disabled={isLoading}
              id={"firstNameField"}
              label="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
            <InputField
              disabled={isLoading}
              id={"lastNameField"}
              label="Last Name"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </Stack>
        </div>
      </CardModal>
    </div>
  );
}

(UserSetup as NextLayoutComponentType).getLayout = getPublicLayout;

export default UserSetup;
