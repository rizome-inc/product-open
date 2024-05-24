import { OnChangeHandlerFunc } from "react-mentions";

export type MentionInputFieldProps = {
  className?: string;
  disabled?: boolean;
  error?: boolean;
  onChange?: OnChangeHandlerFunc;
  value?: string;
};

export const MentionTemplate =
  '<span contenteditable="false" data-placeholder="true" data-id="__id__" data-placeholder-type="mention">__display__</span>';
