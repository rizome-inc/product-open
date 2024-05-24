import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";

export function AddButton(props: ButtonProps) {
  return (
    <Button variant="outlined" {...props}>
      <AddIcon />
      <Box sx={{ ml: 0.5 }} component={"span"}>
        {"Add"}
      </Box>
    </Button>
  );
}
