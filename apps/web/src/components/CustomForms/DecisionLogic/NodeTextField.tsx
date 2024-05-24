import { DecisionLogicNode } from "@/types";
import { mergeSxStyles } from "@/util/misc";
import { Theme } from "@emotion/react";
import { SxProps } from "@mui/material";
import { DL_TextField } from "./DL_TextField";

type NodeTextFieldProps = {
  node: DecisionLogicNode;
  handleInputChange: (id: string, newValue: string) => void;
  label?: string;
  sx?: SxProps<Theme>;
};

export const NodeTextField = ({ node, handleInputChange, label, sx }: NodeTextFieldProps) => {
  return (
    <DL_TextField
      value={node.value}
      label={label}
      onChange={(e) => handleInputChange(node.id, e.target.value)}
      sx={mergeSxStyles(
        {
          "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
            marginTop: -1.3,
          },
        },
        sx,
      )}
    />
  );
};
