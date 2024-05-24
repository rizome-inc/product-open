import { ThemeOptions, createTheme } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    error: {
      main: "#EF1351",
      dark: "#EF1351",
      light: "#FBE5E6",
    },
    divider: "#BBBBBB",
    highlight: {
      main: "#AB25E3",
      light: "#EFDBFB",
    },
    info: {
      main: "#333333",
    },
    primary: {
      main: "#3B24E8",
      light: "#D8DFFE",
      dark: "#3B24E8",
    },
    secondary: {
      main: "#3B24E8",
      dark: "#3B24E8",
      light: "#D8DFFE",
    },
    success: {
      main: "#1AA499",
      light: "#E4F1EF",
      dark: "#1AA499",
    },
    text: {
      primary: "#333333",
      secondary: "#777777",
      disabled: "#777777",
    },
    warning: {
      main: "#EC9018",
      dark: "#EC9018",
      light: "#F8EADD",
    },
    action: {
      disabledBackground: "#eee",
      disabled: "#777",
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 2,
  },
  typography: (palette) => ({
    allVariants: {
      fontFamily: "Helvetica",
      fontSize: 14,
      fontWeight: 400,
      lineHeight: "21px",
      textTransform: "none",
      overflowWrap: "break-word",
    },
    em: {
      color: palette.text.primary,
      fontSize: 14,
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "21px",
    },
    explanitory: {
      color: palette.text.secondary,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: "21px",
    },
    fontFamily: "Helvetica",
    fontSize: 14,
    fontWeightRegular: 400,
    h1: {
      color: palette.text.primary,
      fontSize: 32,
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "48px",
    },
    h2: {
      color: palette.text.primary,
      fontSize: 21,
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "32px",
    },
    tertiary: {
      color: palette.text.secondary,
      fontSize: 14,
      fontStyle: "italic",
      fontWeight: 300,
      lineHeight: "21px",
    },
  }),
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#eeeeee",
          boxShadow: "none",
          height: "45px",
          padding: "0 32px",
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        outlined: {
          color: "#3B24E8",
          borderWidth: 2,
          borderColor: "#3B24E8",
          fontSize: 14,
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "21px",
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
      variants: [
        {
          props: { variant: "appHeader" },
          style: {
            color: "#333",
            "&.AppHeaderButtonSelected": {
              backgroundColor: "#EFDBFB",
            },
          },
        },
      ],
    },
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: "#333",
        },
        tooltip: {
          backgroundColor: "#333",
          boxShadow: "0px 5px 5px 0px rgba(0, 0, 0, 0.12)",
          color: "#eee",
          padding: "6px 16px",
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          em: "em",
          explanitory: "span",
          tertiary: "span",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: () => ({
          borderColor: "#777",
        }),
      },
      variants: [
        {
          props: { variant: "outlined", multiline: false },
          style: ({ theme }) => ({
            "& input": {
              background: "#fff",
              color: theme.palette.text.primary,
              padding: "6px 9px",
              borderColor: "#777",
              "&.Mui-disabled": {
                background: "#eee",
              },
            },
            "& fieldset": {
              borderWidth: "2px",
              borderColor: "#777",
            },
          }),
        },
        {
          props: { variant: "outlined", multiline: true },
          style: ({ theme }) => ({
            "& .MuiInputBase-multiline": {
              background: "#fff",
              color: theme.palette.text.primary,
              padding: "6px 9px",
              borderColor: "#777",
              "&.Mui-disabled": {
                background: "#eee",
              },
            },
            "& fieldset": {
              borderWidth: "2px",
              borderColor: "#777",
            },
          }),
        },
      ],
    },
    MuiTable: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: "#bbb",
          borderRadius: theme.shape.borderRadius,
          borderWidth: "1px",
        }),
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.MuiPaper-root": {
            boxShadow: "none",
            border: `1px solid ${theme.palette.divider}`,
          },
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: () => ({
          "& .MuiTableCell-head": {
            fontWeight: 700,
          },
          "& .MuiTableRow-head": {
            background: "#eee",
          },
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: "#fff",
          boxSizing: "border-box",
          "&:nth-of-type(even)": {
            backgroundColor: "#FAFAFA",
          },
          "&:not(:only-child)": {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
        }),
      },
    },
    MuiTableCell: {
      variants: [
        {
          props: { variant: "moreMenu" },
          style: ({ theme }) => ({
            boxSizing: "border-box",
            color: theme.palette.primary.main,
            padding: 0,
            textAlign: "center",
            width: 70,
            [theme.breakpoints.down("sm")]: {
              width: 50,
            },
          }),
        },
      ],
      styleOverrides: {
        root: () => ({
          border: "none",
          padding: "8px 24px",
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: "24px",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: "24px" },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: () => ({
          justifyContent: "flex-start",
          padding: "24px",
          "& >:not(:first-of-type)": {
            marginLeft: "14px",
          },
        }),
      },
    },
    MuiListItem: {
      defaultProps: {
        disableGutters: true,
        disablePadding: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `2px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          "& .MuiListItemButton-root": {
            padding: theme.spacing(1, 2),
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "24px",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiTabs-indicator": {
            backgroundColor: theme.palette.highlight?.main,
            borderRadius: "1px",
            height: "2px",
          },
          "& .MuiTabs-flexContainer": {
            gap: theme.spacing(3),
          },
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-selected": {
            ...theme.typography.em,
          },
        }),
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          padding: 0,
          paddingLeft: "5px",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          boxSizing: "border-box",
          height: "33px",
          padding: "6px 9px",
          "&.MuiSelect-multiple": {
            padding: "4px 32px 4px 6px",
          },
          "&.Mui-disabled": {
            background: "#eee",
          },
        },
      },
    },
  },
};

export const Theme = createTheme(themeOptions);
