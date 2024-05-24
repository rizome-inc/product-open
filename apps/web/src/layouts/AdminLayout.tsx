import { useUserSessionContext } from "@/hooks/userSession";
import { useRouter } from "next/router";
import { useEffect } from "react";

function AdminLayout({ children }: React.PropsWithChildren) {
  const { isAdmin } = useUserSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push("/projects");
    }
  }, [isAdmin, router]);

  return isAdmin ? <>{children}</> : null;
}

export default AdminLayout;
