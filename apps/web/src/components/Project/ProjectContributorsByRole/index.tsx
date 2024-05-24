import { AddButton } from "@/components/AddButton";
import { UserSelect } from "@/components/UserSelect";
import { useToaster } from "@/context/useToaster";
import CloseIcon from "@mui/icons-material/Close";
import { SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  ContributorRole,
  ContributorSchema,
  FlowProjectSchema,
  ProjectSchema,
  UserSchema,
} from "xylem";

export function ProjectContributorsByRole({
  contributors,
  description,
  onAddClicked,
  onContributorsChanged,
  onInviteUserClicked,
  onRemoveClicked,
  project,
  role,
  sx,
}: {
  contributors?: (ContributorSchema | null)[];
  description?: string | string[];
  onAddClicked?: () => void;
  onContributorsChanged?: (contributors: (ContributorSchema | null)[]) => void;
  onInviteUserClicked?: () => void;
  onRemoveClicked?: (contributor: ContributorSchema | null, index: number) => void;
  project?: ProjectSchema | FlowProjectSchema;
  role: ContributorRole;
  sx?: SxProps;
}) {
  const { toastError } = useToaster();

  const onSelectionChanged =
    (existingUser: Partial<UserSchema> | null | undefined, i: number) =>
    (newUser: Partial<UserSchema> | null) => {
      if (contributors) {
        if (existingUser?.id === newUser?.id) {
          return;
        }
        const index = !existingUser
          ? -1
          : contributors.findIndex((x) => x?.user?.id === newUser?.id);
        if (index === -1 && project?.id && newUser?.id) {
          const updatedContributors = contributors.slice();
          updatedContributors.splice(
            i,
            1,
            !newUser
              ? null
              : {
                  role,
                  user: newUser,
                },
          );
          onContributorsChanged?.(updatedContributors);
        } else {
          toastError("User cannot be selected twice");
        }
      }
    };
  const onRemoveClick = (contributor: ContributorSchema | null, i: number) => () => {
    onRemoveClicked?.(contributor, i);
  };

  return (
    <Box sx={sx}>
      <Typography sx={{ mb: 1, display: "block" }} variant="em">
        {role === ContributorRole.ReadOnly ? "Read access only" : `${role}s`}
      </Typography>
      <Grid spacing={2} direction="row" container={true}>
        <Grid item={true} xs={6}>
          <Stack spacing={1} direction="column">
            {contributors?.map((contributor, i) => {
              return (
                <Stack key={i} spacing={1} direction="row">
                  <UserSelect
                    onInviteUserClicked={onInviteUserClicked}
                    onSelectionChanged={onSelectionChanged(contributor?.user, i)}
                    selectedUser={contributor?.user || null}
                    sx={{ width: "100%" }}
                  />
                  {role !== ContributorRole.Owner ||
                  (role === ContributorRole.Owner &&
                    contributors.filter((x) => Boolean(x?.user)).length > 1) ? (
                    <IconButton onClick={onRemoveClick(contributor, i)}>
                      <CloseIcon color={"warning"} />
                    </IconButton>
                  ) : null}
                </Stack>
              );
            })}
            <AddButton sx={{ alignSelf: "flex-start" }} onClick={onAddClicked} />
          </Stack>
        </Grid>
        <Grid item={true} xs={6}>
          {description ? (
            <Card
              sx={{
                background: "#eee",
                padding: "6px 16px",
                boxShadow: "none",
              }}
            >
              {(Array.isArray(description) ? description : [description]).map((x, i) => {
                return (
                  <Typography key={i} color={(theme) => theme.palette.text.secondary}>
                    {x}
                  </Typography>
                );
              })}
            </Card>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}
