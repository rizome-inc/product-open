import { Box } from "@mui/system";

// fixme: MUI Calculation icon doesn't support the inverted fill easily, so I just exported the SVG from Figma
export default function AddExpressionButton({ handleClick }: { handleClick: () => void }) {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 33,
        height: 33,
        borderRadius: 4,
        border: 2,
        borderColor: theme.palette.primary.main,
        "& svg path": {
          fill: theme.palette.primary.main,
        },
      })}
      onClick={handleClick}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10.75 4.86667H2.41667V7.36667H10.75V4.86667Z" />
        <path d="M22 18.25H13.6667V20.75H22V18.25Z" />
        <path d="M22 14.0833H13.6667V16.5833H22V14.0833Z" />
        <path d="M5.33333 22H7.83333V18.6667H11.1667V16.1667H7.83333V12.8333H5.33333V16.1667H2V18.6667H5.33333V22Z" />
        <path d="M15.4833 10.25L17.8333 7.9L20.1833 10.25L21.95 8.48333L19.6 6.11667L21.95 3.76667L20.1833 2L17.8333 4.35L15.4833 2L13.7167 3.76667L16.0667 6.11667L13.7167 8.48333L15.4833 10.25Z" />
      </svg>
    </Box>
  );
}
