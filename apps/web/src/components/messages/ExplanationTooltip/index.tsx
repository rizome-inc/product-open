import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

type ExplanationTooltipProps = Omit<TooltipProps, "arrow" | "componentsProps">;

export function ExplanationTooltip({ title, ...restProps }: ExplanationTooltipProps) {
  return (
    <Tooltip
      arrow={true}
      componentsProps={{
        arrow: {
          sx: {
            color: "#eee",
          },
        },
        tooltip: {
          sx: {
            backgroundColor: "#eee",
            boxShadow: "none",
            color: "text.secondary",
            padding: 0,
          },
        },
      }}
      title={
        <Typography
          component={"span"}
          sx={[
            {
              borderRadius: 1,
              boxSizing: "border-box",
              color: "text.secondary",
              display: "flex",
              grap: 1,
              padding: "6px 16px",
            },
          ]}
        >
          {title}
        </Typography>
      }
      {...restProps}
    />
  );
}
