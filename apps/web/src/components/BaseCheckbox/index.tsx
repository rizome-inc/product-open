import CheckBoxOutlineBlankOutlinedIcon from "@mui/icons-material/CheckBoxOutlineBlankOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import Box from "@mui/material/Box";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";

export function BaseCheckbox(props: CheckboxProps) {
  return (
    <Checkbox
      icon={<CheckBoxOutlineBlankOutlinedIcon />}
      checkedIcon={
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckBoxOutlineBlankOutlinedIcon sx={{ color: "#777" }} />
          <CheckOutlinedIcon
            sx={(theme) => ({
              color: theme.palette.highlight?.main,
              position: "absolute",
              width: "13px",
              height: "auto",
            })}
          />
        </Box>
      }
      indeterminateIcon={
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckBoxOutlineBlankOutlinedIcon sx={{ color: "#777" }} />
          <HorizontalRuleOutlinedIcon
            sx={(theme) => ({
              color: theme.palette.highlight?.main,
              position: "absolute",
              width: "13px",
              height: "auto",
            })}
          />
        </Box>
      }
      {...props}
    />
  );
}
