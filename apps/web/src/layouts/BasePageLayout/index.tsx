import { mergeSxStyles } from "@/util/misc";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { StuckActionButton } from "./presentation";

export type BasePageLayoutProps = {
  actions?: React.ReactNode;
  bodySx?: SxProps<Theme>;
  hideDefaultActions?: boolean;
  onRenderBreadcrumbPathComponent?: (
    pathComp: string,
    index: number,
    pathComps: string[],
    urlComps: string[],
  ) => React.ReactNode;
  sx?: SxProps<Theme>;
  title?: React.ReactNode;
  subtitle?: string;
};

export function BasePageLayout({
  actions,
  bodySx,
  hideDefaultActions,
  onRenderBreadcrumbPathComponent,
  children,
  sx,
  title,
  subtitle,
}: React.PropsWithChildren<BasePageLayoutProps>) {
  const { pathname, asPath } = useRouter();

  const [pathnameComps, urlComps] = React.useMemo(
    () => [pathname?.split("/").filter(Boolean), asPath?.split("/").filter(Boolean)],
    [asPath, pathname],
  );
  const renderBreadcrumbPathComponents = React.useCallback(() => {
    const renderDefaultBreadcrumbComponent = (breadcrumbComp: string, i: number) => {
      if (i === pathnameComps.length - 1) {
        return (
          <Typography color="text.primary" key={`${breadcrumbComp}-${i}`}>
            {breadcrumbComp}
          </Typography>
        );
      }
      return (
        <Link
          href={`\/${urlComps.slice(0, i + 1).join("/")}`}
          key={`${breadcrumbComp}-${i}`}
          passHref={true}
          style={{ textDecoration: "none" }}
        >
          <MuiLink component={"span"} underline="hover">
            {breadcrumbComp}
          </MuiLink>
        </Link>
      );
    };
    return pathnameComps.map((x, i) => {
      const comp = onRenderBreadcrumbPathComponent?.(x, i, pathnameComps, urlComps);
      if (comp === false) {
        return null;
      }

      if (onRenderBreadcrumbPathComponent && comp && typeof comp !== "string") {
        return comp;
      }

      return renderDefaultBreadcrumbComponent(typeof comp === "string" ? comp : x, i);
    });
  }, [pathnameComps, onRenderBreadcrumbPathComponent, urlComps]);

  return (
    <Box sx={mergeSxStyles({ height: "100%" }, sx)}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "83px",
          paddingTop: 2,
          paddingX: 4,
        }}
      >
        <Breadcrumbs
          sx={{
            alignSlef: "top",
          }}
        >
          {pathnameComps?.length > 1 ? renderBreadcrumbPathComponents() : null}
        </Breadcrumbs>
        <Box
          sx={{
            alignSelf: "bottom",
            alignItems: "center",
            display: "flex",
            height: "48px",
            justifyContent: "space-between",
            marginRight: 1,
          }}
        >
          {typeof title === "string" ? (
            <Typography variant="h1" noWrap={true}>
              {title}
            </Typography>
          ) : (
            title
          )}

          <Stack direction={"row"} spacing={"14px"} sx={{ alignItems: "center" }}>
            {!hideDefaultActions ? <StuckActionButton /> : null}
            {actions}
          </Stack>
        </Box>
        <Box>{subtitle && <Typography sx={{ mt: 0.5 }}>{subtitle}</Typography>}</Box>
      </Box>
      <Box
        sx={mergeSxStyles(
          {
            boxSizing: "border-box",
            height: "calc(100% - 83px)",
            mt: 4,
            paddingX: 4,
          },
          bodySx,
        )}
      >
        {children}
      </Box>
    </Box>
  );
}
