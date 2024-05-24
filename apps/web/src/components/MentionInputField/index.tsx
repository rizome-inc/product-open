import { useUsersQuery } from "@/queries";
import { getEntityDisplayName } from "@/util/misc";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { Mention, MentionsInput, SuggestionDataItem } from "react-mentions";
import { UserSchema } from "xylem";
import { MentionInputFieldProps, MentionTemplate } from "./models";
import { MentionClassName, MentionInputClassName, StyledFormControl } from "./presentation";

export function MentionInputField(props: MentionInputFieldProps) {
  const { value, onChange } = props;
  const { data: users } = useUsersQuery();
  const userOptions: (SuggestionDataItem & { dataContext: UserSchema })[] =
    users?.map((x) => ({
      dataContext: x,
      display: getEntityDisplayName(x),
      id: x.id!,
    })) || [];
  const renderSuggestionsContainer = (children: React.ReactNode) => {
    return <Paper sx={{ margin: 1 }}>{children}</Paper>;
  };

  const renderSuggestion = (suggestion: SuggestionDataItem) => (
    <MenuItem component={"span"} key={suggestion.id}>
      {suggestion.display}
    </MenuItem>
  );

  return (
    <StyledFormControl variant="outlined">
      <MentionsInput
        className={MentionInputClassName}
        value={value || ""}
        onChange={onChange}
        customSuggestionsContainer={renderSuggestionsContainer}
      >
        <Mention
          className={MentionClassName}
          data={userOptions}
          displayTransform={(id) =>
            `${userOptions.find((x) => parseInt(id, 10) === x.id)?.display}`
          }
          markup={MentionTemplate}
          renderSuggestion={renderSuggestion}
          trigger="@"
        />
      </MentionsInput>
    </StyledFormControl>
  );
}
