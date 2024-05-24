import { FrownIcon } from "@/components/svgIcons/FrownIcon";
import { AccessTime, Hail, SentimentSatisfiedAlt, Warning } from "@mui/icons-material";
import { SxProps, Theme } from "@mui/material/styles";
import { useMemo } from "react";
import { CalloutMessageSize, CalloutMessageStatus } from "./types";

export function useCalloutMessageColors(status: CalloutMessageStatus) {
  let backgroundColor: string | undefined = undefined;
  let color: string | undefined = undefined;
  switch (status) {
    case CalloutMessageStatus.Success: {
      color = "success.main";
      backgroundColor = "success.light";
      break;
    }
    case CalloutMessageStatus.Error: {
      color = "error.main";
      backgroundColor = "error.light";
      break;
    }
    case CalloutMessageStatus.ActionRequired:
    case CalloutMessageStatus.Warning:
    case CalloutMessageStatus.Pending: {
      color = "warning.main";
      backgroundColor = "warning.light";
      break;
    }
    default: {
      break;
    }
  }
  return { backgroundColor, color } as const;
}

export function useCalloutMessage(
  size: CalloutMessageSize,
  status: CalloutMessageStatus,
  shadow?: boolean,
) {
  const { backgroundColor, color } = useCalloutMessageColors(status);
  let icon: React.ReactNode = undefined;
  switch (status) {
    case CalloutMessageStatus.Success: {
      icon = <SentimentSatisfiedAlt sx={{ color: "success.main", fontSize: "22px" }} />;
      break;
    }
    case CalloutMessageStatus.Pending: {
      icon = <AccessTime sx={{ color: "warning.main", fontSize: "22px" }} />;
      break;
    }
    case CalloutMessageStatus.ActionRequired: {
      icon = <Hail sx={{ color: "warning.main", fontSize: "22px" }} />;
      break;
    }
    case CalloutMessageStatus.Warning: {
      icon = <Warning sx={{ color: "warning.main", fontSize: "22px" }} />;
      break;
    }
    case CalloutMessageStatus.Error: {
      icon = <FrownIcon />;
      break;
    }
    default: {
      break;
    }
  }

  const baseSxStyle = useMemo<SxProps<Theme>>(() => {
    return {
      backgroundColor,
      borderLeft: color ? "6px solid" : undefined,
      borderLeftColor: color,
      borderRadius: 1,
      boxShadow: shadow ? "0px 5px 5px 0px rgba(0, 0, 0, 0.12)" : undefined,
      boxSizing: "border-box",
      color,
      display: "flex",
      grap: 1,
      padding: size === CalloutMessageSize.Small ? "6px 16px" : "24px 16px",
    };
  }, [backgroundColor, color, shadow, size]);

  return { color, backgroundColor, icon, baseSxStyle } as const;
}
