import { Theme } from "@/styles/theme";
import { Box } from "@mui/system";
import { ReactNode } from "react";

// todo: consider making this a forwardRef; consider having this inherit color props for the type of node it is

export const StyledHandle = ({
  handles,
  isEditing,
  isExpression = false,
}: {
  handles: ReactNode[];
  isEditing: boolean;
  isExpression?: boolean;
}) => {
  const handleSpace = isExpression ? (isEditing ? "-5px" : 0) : isEditing ? "-17px" : "-6px";

  return (
    <Box
      sx={() => ({
        "& .react-flow__handle": {
          backgroundColor: Theme.palette.divider,
          width: "12px",
          height: "12px",
        },
        "& .react-flow__handle-top": {
          top: handleSpace,
        },
        "& .react-flow__handle-bottom": {
          bottom: handleSpace,
        },
        "& .react-flow__handle-left": {
          left: handleSpace,
        },
        "& .react-flow__handle-right": {
          right: handleSpace,
        },
        opacity: isEditing ? 1 : 0,
      })}
    >
      {handles}
    </Box>
  );
};
