import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  value?: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
  }[];
  disabled?: boolean;
};

/**
 * The MUI Select component doesn't play nice when nested within other components.
 * ControlledSelect uses the MUI control props to fix the event handlers.
 *
 * https://mui.com/material-ui/react-select/#controlling-the-open-state
 */
export function ControlledSelect({
  open,
  setOpen,
  value,
  onChange,
  options,
  disabled = false,
}: Props) {
  const [localValue, setLocalValue] = useState(value || "");
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  // Using local state like this means we still need to manually listen for changes from other users
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChange = (e: SelectChangeEvent) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  useEffect(() => {
    handleClose();
  }, [handleClose, localValue]);

  //close the menu when someone clicks outside of it
  const ref = useRef<HTMLElement>();
  const checkForOutsideClick = useCallback(() => {
    /*const target = e.target as Node;
      if (open && ref.current && !ref.current.contains(target)) {
        handleClose();
      }*/
    setTimeout(() => {
      setOpen(false);
    }, 200);
  }, [open, handleClose, ref]);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", checkForOutsideClick);
    } else {
      document.removeEventListener("mousedown", checkForOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", checkForOutsideClick);
    };
  }, [open, checkForOutsideClick]);

  return (
    <FormControl
      sx={{
        alignSelf: "flex-start",
        width: "100%",
        "& fieldset": () => ({ borderWidth: "2px", borderColor: "#777" }),
      }}
      onClick={() => {
        !disabled ? handleOpen() : null;
      }}
      disabled={disabled}
    >
      <Select
        onClose={handleClose}
        open={open}
        onChange={handleChange}
        value={localValue}
        ref={ref}
      >
        {options.map((o, i) => (
          <MenuItem key={`option-${i}`} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
