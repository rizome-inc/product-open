import { useProjectContext } from "@/context/project";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./styles.module.css";

export function ProjectBreadcrumbs() {
  const { query } = useRouter();
  const org = query.organization;
  const { project } = useProjectContext();
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link
        className={styles["breadcrumb-link"]}
        href={{
          pathname: "/projects",
          query: {
            organization: org || "",
          },
        }}
      >
        projects
      </Link>
      <span className={styles["breadcrumb-link-last"]}>{project?.name}</span>
    </Breadcrumbs>
  );
}
