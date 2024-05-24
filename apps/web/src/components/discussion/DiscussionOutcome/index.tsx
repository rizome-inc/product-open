import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { InputField } from "@/components/InputField";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as React from "react";

export function DiscussionOutcome() {
  const { discussion } = useDiscussionContext();
  const { isEditing, setEditableValue } = useDiscussionEditingContext();

  const [outcome, setOutcome] = React.useState<string | undefined>(
    discussion?.outcome ?? undefined,
  );

  React.useEffect(() => {
    if (isEditing) {
      setOutcome(discussion?.outcome ?? undefined);
    }
  }, [isEditing, discussion?.outcome]);

  const onInputChanged = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setOutcome(target.value);
  };

  const onBlur = () => {
    setEditableValue("outcome", outcome);
  };
  return isEditing ? (
    <InputField
      id="discussion.outcome"
      label="Outcome"
      minRows={2}
      multiline={true}
      name="outcome"
      onBlur={onBlur}
      onChange={onInputChanged}
      value={outcome || ""}
    />
  ) : (
    <div>
      <Typography variant="em">Outcome</Typography>
      <Box>
        <ReadOnlyText value={discussion?.outcome ?? undefined} />
      </Box>
    </div>
  );
}
