import Menu, { MenuProps } from "@mui/material/Menu";
import { alpha, styled } from "@mui/material/styles";

export const BaseMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 0,
    marginTop: 0,
    minWidth: 170,
    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& a": {
      textDecoration: "none",
    },
    "& .MuiMenuItem-root": {
      fontSize: "14px",
      color: theme.palette.primary.main,
      gap: 6,
      padding: "2px 11px",
      "&:active": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}));
