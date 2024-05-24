import { BasePageActionButton } from "@/components/BasePageActionButton";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Tooltip } from "@/components/CustomForms/Tooltip";
import { InviteUsersModal } from "@/components/InviteUsersModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MoreMenuTableCell } from "@/components/MoreMenuTableCell";
import { useErrorModalContext } from "@/context/errorModals";
import { useUserSessionContext } from "@/hooks/userSession";
import AdminLayout from "@/layouts/AdminLayout";
import { BasePageLayout } from "@/layouts/BasePageLayout";
import { useUpdateUserMutation, useUsersQuery } from "@/queries";
import { getEntityDisplayName, mergeSxStyles } from "@/util/misc";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/material/styles";
import * as React from "react";
import { UserRole, UserSchema, UserStatus } from "xylem";

export const columnStyles: SxProps<Theme> = {
  width: "calc((90% - 70px)/2)",
};

export const columnStylesSmall: SxProps<Theme> = {
  width: "10%",
};

// fixme: there should be an admin-only layout
export default function Users() {
  const { user } = useUserSessionContext();
  const { showErrorModal } = useErrorModalContext();

  const [showInviteUsersModal, setShowInviteUsersModal] = React.useState<boolean>(false);

  const [userToDeactivate, setUserToDeactivate] = React.useState<UserSchema | null>(null);
  const [userToDemote, setUserToDemote] = React.useState<UserSchema | null>(null);

  const { data: allUsers, isLoading: isLoadingAllUsers } = useUsersQuery({
    refetchOnWindowFocus: false,
  });

  const [users, setUsers] = React.useState<UserSchema[]>([]);
  const [admins, setAdmins] = React.useState<UserSchema[]>([]);
  React.useEffect(() => {
    const isAdmin = (u: UserSchema) =>
      u.roles?.includes(UserRole.Admin) || u.roles?.includes(UserRole.SuperAdmin);
    if (allUsers) {
      setUsers(allUsers.filter((u) => !isAdmin(u)));
      setAdmins(allUsers.filter(isAdmin));
    }
  }, [allUsers]);

  const { mutateAsync: updateUserAsync } = useUpdateUserMutation();

  const updateUserRole = (user: UserSchema, role: UserRole) => async () => {
    try {
      const updatedUser = await updateUserAsync({
        id: user.id!,
        user: { roles: [role] },
      });
      if (role === UserRole.Admin) {
        setAdmins((a) => [...a, updatedUser]);
        setUsers((u) => u.filter((x) => x.id !== user.id!));
      } else {
        setUsers((u) => [...u, updatedUser]);
        setAdmins((a) => a.filter((x) => x.id !== user.id!));
      }
    } catch (error) {
      showErrorModal(error);
    }
  };

  const updateUserStatus = (user: UserSchema, status: UserStatus) => async () => {
    try {
      const updatedUser = await updateUserAsync({
        id: user.id!,
        user: { status },
      });
      if (admins.find((a) => a.id === user.id)) {
        setAdmins((a) => [...a.filter((x) => x.id !== user.id), updatedUser]);
      } else {
        setUsers((u) => [...u.filter((x) => x.id !== user.id), updatedUser]);
      }
    } catch (error) {
      showErrorModal(error);
    }
  };

  const onCloseInviteUsersModal = () => setShowInviteUsersModal(false);

  return (
    <AdminLayout>
      <BasePageLayout
        actions={
          <>
            <BasePageActionButton
              id="inviteUserStart1"
              variant="contained"
              onClick={() => setShowInviteUsersModal(true)}
            >
              <span>{"Invite Users"}</span>
            </BasePageActionButton>
          </>
        }
        title="Users"
        subtitle="User settings control who can do what within Rizome"
      >
        {isLoadingAllUsers ? (
          <LoadingSpinner absoluteCenterPosition={true} />
        ) : (
          <Stack spacing={1} direction={"column"}>
            <Typography variant="h2">Admins</Typography>
            <TableContainer component={Paper} sx={{ "&&": { marginBottom: "16px" } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={columnStyles}>Name</TableCell>
                    <TableCell sx={columnStyles}>Email</TableCell>
                    <TableCell sx={columnStylesSmall}>Status</TableCell>
                    <TableCell variant="moreMenu" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((admin) => {
                    return (
                      <TableRow key={admin.id} onClick={() => {}}>
                        <TableCell sx={mergeSxStyles({ cursor: "pointer" }, columnStyles)}>
                          {getEntityDisplayName(admin)}
                        </TableCell>
                        <TableCell sx={columnStyles}>{admin.email}</TableCell>
                        <TableCell sx={columnStylesSmall}>{admin.status}</TableCell>
                        {/* todo: reevaluate this logic if we add more menu items */}
                        {user?.id != admin.id ? (
                          <MoreMenuTableCell>
                            <MenuItem onClick={() => setUserToDemote(admin)}>
                              Revoke Admin Privileges
                            </MenuItem>
                          </MoreMenuTableCell>
                        ) : (
                          <TableCell>
                            <Tooltip
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              description="You cannot remove your own admin privileges"
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="h2">Users</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={columnStyles}>Name</TableCell>
                    <TableCell sx={columnStyles}>Email</TableCell>
                    <TableCell sx={columnStylesSmall}>Status</TableCell>
                    <TableCell variant="moreMenu" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    return (
                      <TableRow key={user.id} onClick={() => {}}>
                        <TableCell sx={mergeSxStyles({ cursor: "pointer" }, columnStyles)}>
                          {getEntityDisplayName(user)}
                        </TableCell>
                        <TableCell sx={columnStyles}>{user.email}</TableCell>
                        <TableCell sx={columnStylesSmall}>{user.status}</TableCell>
                        <MoreMenuTableCell>
                          <MenuItem onClick={updateUserRole(user, UserRole.Admin)}>
                            Grant Admin Privileges
                          </MenuItem>
                          <MenuItem onClick={() => setUserToDeactivate(user)}>
                            Deactivate User
                          </MenuItem>
                        </MoreMenuTableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
        <InviteUsersModal open={showInviteUsersModal} onRequestClose={onCloseInviteUsersModal} />
        <ConfirmationModal
          title="Deactivate User"
          message={`Are you sure you want to deactivate ${getEntityDisplayName(userToDeactivate)}?`}
          closeText="Keep user"
          confirmationCta="Deactivate"
          onRequestClose={(didConfirm: boolean) => {
            if (didConfirm && userToDeactivate) {
              updateUserStatus(userToDeactivate, UserStatus.Deactivated)();
            }
            setUserToDeactivate(null);
          }}
          open={Boolean(userToDeactivate)}
        />
        <ConfirmationModal
          title="Revoke Admin Privileges"
          message={`Are you sure you want to revoke admin privileges for ${getEntityDisplayName(
            userToDemote,
          )}?`}
          closeText="Keep admin privileges"
          confirmationCta="Revoke"
          onRequestClose={(didConfirm: boolean) => {
            if (didConfirm && userToDemote) {
              updateUserRole(userToDemote, UserRole.User)();
            }
            setUserToDemote(null);
          }}
          open={Boolean(userToDemote)}
        />
      </BasePageLayout>
    </AdminLayout>
  );
}
