import { SignInModal } from "@/components/login/SignInModal";
import { getPublicLayout } from "@/layouts/PublicLayout";
import { Box } from "@mui/material";
import { NextLayoutComponentType } from "next";
import { useRouter } from "next/router";

function SigninPage() {
  const router = useRouter();

  // const { signOut } = useUserSessionContext();

  // // Sign out the current user on page load
  // useEffect(() => {
  //   signOut();
  // }, []);

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
      <SignInModal />
    </Box>
  );
}

(SigninPage as NextLayoutComponentType).getLayout = getPublicLayout;

export default SigninPage;
