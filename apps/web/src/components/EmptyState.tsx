import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

interface EmptyStateProps {
  title: string;
  message?: string | string[];
  action?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  primaryAction?: boolean;
  disabled?: boolean;
  actionId?: string;

  action2?: string;
  onClick2?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

function EmptyState({
  title,
  message,
  action,
  onClick,
  primaryAction,
  actionId,
  disabled = false,
  action2,
  onClick2,
}: EmptyStateProps) {
  return (
    <div className="emptyState">
      <Typography variant="h2" sx={message || action ? { marginBottom: "16px" } : null}>
        {title}
      </Typography>
      {message && (
        <Stack
          direction={"column"}
          spacing={1}
          sx={{
            marginBottom: action ? 2 : 0,
          }}
        >
          {(Array.isArray(message) ? message : [message]).map((item, index) => (
            <Typography component={"p"} key={index}>
              {item}
            </Typography>
          ))}
        </Stack>
      )}
      {action && (
        <Button
          sx={{ backgroundColor: !primaryAction ? "#fff" : undefined }}
          variant={primaryAction ? "contained" : "outlined"}
          disabled={disabled}
          onClick={onClick}
          id={actionId}
        >
          {action}
        </Button>
      )}
      {action2 && (
        <Button sx={{ marginLeft: "16px" }} variant={"text"} onClick={onClick2}>
          {action2}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
