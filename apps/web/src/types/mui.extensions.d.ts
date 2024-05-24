import "@mui/material/Button";
import "@mui/material/Typography";
import "@mui/material/styles";

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    highlight?: Palette["primary"];
  }
  interface PaletteOptions {
    highlight?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/styles" {
  interface TypographyVariants {
    em: React.CSSProperties;
    explanitory: React.CSSProperties;
    tertiary: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    em?: React.CSSProperties;
    explanitory?: React.CSSProperties;
    tertiary?: React.CSSProperties;
  }

  interface ButtonVariants {
    appHeader: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface ButtonVariantsOptions {
    appHeader?: React.CSSProperties;
  }

  interface TableCellVariants {
    moreMenu: React.CSSProperties;
  }

  interface TableCellVariantsOptions {
    moreMenu?: React.CSSProperties;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    appHeader: true;
  }
}

declare module "@mui/material/TableCell" {
  interface TableCellPropsVariantOverrides {
    moreMenu: true;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    em: true;
    explanitory: true;
    tertiary: true;
  }
}
