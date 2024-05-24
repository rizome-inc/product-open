import { useUsersQuery } from "@/queries";
import { getEntityDisplayName } from "@/util/misc";
import SearchIcon from "@mui/icons-material/Search";
import { Box, SxProps } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { UserSchema } from "xylem";
import { InputField } from "../InputField";

export const UserSelect = ({
  disabled,
  onInviteUserClicked,
  onSelectionChanged,
  selectedUser,
  sx,
}: {
  disabled?: boolean;
  onInviteUserClicked?: () => void;
  onSelectionChanged?: (selectedUser: Partial<UserSchema> | null) => void;
  selectedUser?: Partial<UserSchema> | null;
  sx?: SxProps;
}) => {
  const { data: users } = useUsersQuery({ refetchOnWindowFocus: false });
  const [user, setUser] = React.useState<Partial<UserSchema> | null | undefined>(
    selectedUser || null,
  );

  const isControlled = Boolean(onSelectionChanged);

  const onChange = (_: React.SyntheticEvent, value: Partial<UserSchema> | null) => {
    isControlled ? onSelectionChanged?.(value) : setUser(value);
  };

  return (
    <Autocomplete<Partial<UserSchema>, false, false | true>
      disabled={disabled}
      disableClearable={true}
      getOptionLabel={getEntityDisplayName}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      ListboxProps={{ style: { maxHeight: 200, overflow: "auto" } }}
      onChange={onChange}
      options={users || []}
      value={isControlled ? selectedUser || null : user || null}
      PaperComponent={({ children }) => {
        return (
          <Paper>
            {children}
            {onInviteUserClicked ? (
              <Button
                id="inviteUserStart2"
                color="primary"
                fullWidth
                sx={{ justifyContent: "flex-start", pl: 2 }}
                onMouseDown={onInviteUserClicked}
              >
                + Invite new user
              </Button>
            ) : null}
          </Paper>
        );
      }}
      renderInput={(params) => (
        <InputField
          {...params}
          InputProps={{
            ...params.InputProps,
            startAdornment: (isControlled ? selectedUser : user) ? null : (
              <InputAdornment position="start" sx={{ margin: 0, pl: 1 }}>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box className="selectUser" component="li" {...props} key={option.id}>
          {getEntityDisplayName(option)}
        </Box>
      )}
      sx={sx}
    />
  );
};
