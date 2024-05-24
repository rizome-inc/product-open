import { InputField } from "@/components/InputField";
import { useDiscussionContext, useDiscussionEditingContext } from "@/context/discussion";
import * as React from "react";

export function DiscussionName() {
  const { discussion } = useDiscussionContext();
  const { isEditing, setEditableValue } = useDiscussionEditingContext();

  const [name, setName] = React.useState<string | undefined>(discussion?.name);

  React.useEffect(() => {
    if (isEditing) {
      setName(discussion?.name);
    }
  }, [isEditing, discussion?.name]);

  const onInputChanged = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setName(target.value);
  };

  const onBlur = () => {
    setEditableValue("name", name);
  };
  return isEditing ? (
    <InputField
      id="discussion.name"
      label="Name"
      name="name"
      onBlur={onBlur}
      onChange={onInputChanged}
      value={name || ""}
      sx={{ mb: 2 }}
    />
  ) : null;
}
