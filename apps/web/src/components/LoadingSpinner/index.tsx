import { mergeSxStyles } from "@/util/misc";
import { SxProps } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

type LoadingSpinnerProps = {
  absoluteCenterPosition?: boolean;
  size?: "small" | "large" | number;
  sx?: SxProps;
};

export function LoadingSpinner({
  size = "large",
  absoluteCenterPosition,
  sx,
}: LoadingSpinnerProps) {
  let side: number = typeof size === "number" ? size : 0;

  if (typeof size === "string") {
    switch (size) {
      case "small": {
        side = 60;
        break;
      }
      default: {
        side = 150;
        break;
      }
    }
  }
  return (
    <CircularProgress
      aria-label="loading"
      color="info"
      role="status"
      sx={mergeSxStyles(
        { width: `${side}px`, height: `${side}px` },
        absoluteCenterPosition
          ? { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
          : null,
        sx,
      )}
    />
  );
}
