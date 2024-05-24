import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { InputField } from "@/components/InputField";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import Typography from "@mui/material/Typography";
import * as React from "react";

export function DiscussionTopic() {
  const { discussion } = useDiscussionContext();
  const { isEditing, setEditableValue } = useDiscussionEditingContext();

  const [topic, setTopic] = React.useState<string | undefined>(discussion?.topic ?? undefined);

  React.useEffect(() => {
    if (isEditing) {
      setTopic(discussion?.topic ?? undefined);
    }
  }, [isEditing, discussion?.topic]);

  const onInputChanged = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(target.value);
  };

  const onBlur = () => {
    setEditableValue("topic", topic);
  };
  return isEditing ? (
    <InputField
      id="discussion.topic"
      label="Topic"
      minRows={2}
      multiline={true}
      name="topic"
      onChange={onInputChanged}
      value={topic || ""}
      onBlur={onBlur}
      sx={{ mb: 2 }}
    />
  ) : (
    <div>
      <Typography variant="em">Topic</Typography>
      <ReadOnlyText sx={{ mb: 2 }} value={discussion?.topic ?? undefined} />
    </div>
  );
}
