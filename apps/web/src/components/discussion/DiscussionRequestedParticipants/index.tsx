import { AddButton } from "@/components/AddButton";
import { UserSelect } from "@/components/UserSelect";
import { useToaster } from "@/context/useToaster";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UserSchema } from "xylem";

export function DicussionRequestedParticipants({
  description,
  onAddClicked,
  onInviteUserClicked,
  onRemoveClicked,
  onUsersChanged,
  users,
}: {
  description?: string | string[];
  onAddClicked?: () => void;
  onInviteUserClicked?: () => void;
  onRemoveClicked?: (user: Partial<UserSchema> | null, index: number) => void;
  onUsersChanged?: (users: (Partial<UserSchema> | null)[]) => void;
  users?: (Partial<UserSchema> | null)[];
}) {
  const { toastError } = useToaster();
  const onSelectionChanged =
    (user: Partial<UserSchema> | null | undefined, i: number) =>
    (value: Partial<UserSchema> | null) => {
      if (users) {
        if (user?.id === value?.id) {
          return;
        }
        const index = users.findIndex((x) => x?.id === value?.id);
        if (index === -1) {
          const updatedUsers = users.slice();
          updatedUsers.splice(i, 1, value || null);
          onUsersChanged?.(updatedUsers);
        } else {
          toastError("User cannot be selected twice");
        }
      }
    };
  const onRemoveClick = (user: Partial<UserSchema> | null, i: number) => () => {
    onRemoveClicked?.(user, i);
  };
  return (
    <Box>
      <Typography sx={{ mb: 1, display: "block" }} variant="em">
        Requested participants
      </Typography>
      <Grid spacing={2} direction="row" container={true}>
        <Grid item={true} xs={6}>
          <Stack spacing={1} direction="column">
            {users?.map((user, i) => {
              return (
                <Stack key={i} spacing={1} direction="row">
                  <UserSelect
                    onInviteUserClicked={onInviteUserClicked}
                    onSelectionChanged={onSelectionChanged(user, i)}
                    selectedUser={user || null}
                    sx={{ width: "100%" }}
                  />
                  <IconButton onClick={onRemoveClick(user, i)}>
                    <CloseIcon color={"warning"} />
                  </IconButton>
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
