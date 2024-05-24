import Paper from "@mui/material/Paper";

export function PublicLayout({ children }: React.PropsWithChildren) {
  return (
    <Paper square={true} elevation={0}>
      {children}
    </Paper>
  );
}

export const getPublicLayout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
