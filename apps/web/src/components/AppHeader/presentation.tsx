import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

export type AppHeaderButtonProps = {
  badgeContent?: React.ReactNode;
  pathname: string;
  iconComponent: React.ComponentType;
  name: string;
};

export function AppHeaderButton({
  badgeContent,
  iconComponent,
  name,
  pathname,
}: AppHeaderButtonProps) {
  const router = useRouter();
  const Icon = iconComponent;
  return (
    <Link href={pathname} passHref={true}>
      <Button
        variant="appHeader"
        className={router.pathname.startsWith(pathname) ? "AppHeaderButtonSelected" : undefined}
      >
        <Badge
          sx={(t) => ({
            "& .MuiBadge-badge": { backgroundColor: t.palette.highlight?.main, color: "white" },
          })}
          badgeContent={badgeContent}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Icon />
        </Badge>
        <Typography component={"span"}>{name}</Typography>
      </Button>
    </Link>
  );
}
