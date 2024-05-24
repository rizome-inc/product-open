import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/system";

// todo: should this be a panel, or live at a different layer (e.g. interaction layer)?
// todo: figure out whether this form of relative theming is what we want, since it's unclear whether it relates to spacing defaults
// todo: figure out how to type theme correctly so we don't need to do extraneous undefined checks
export default function AddButton({ handleClick }: { handleClick: () => void }) {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.palette.primary.main,
        width: 33,
        height: 33,
        borderRadius: 4,
        border: 2,
        borderColor: theme.palette.primary.main,
      })}
      onClick={handleClick}
    >
      <AddIcon
        sx={(theme) => ({
          // padding: 6,
          color: theme.palette.primary.main,
        })}
      />
    </Box>
  );
}
