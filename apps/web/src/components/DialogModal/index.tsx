import CloseIcon from "@mui/icons-material/Close";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

export type DialogModalProps = Omit<DialogProps, "title"> & {
  actions?: React.ReactNode;
  hideActions?: boolean;
  title?: React.ReactNode;
  closeId?: string;
};

export function DialogModal({
  actions,
  children,
  hideActions,
  onClose,
  closeId,
  title,
  ...restProps
}: DialogModalProps) {
  return (
    <Dialog {...restProps}>
      <DialogTitle variant="h2">
        {title}
        {onClose ? (
          <IconButton
            id={closeId}
            onClick={(e) => onClose(e, "escapeKeyDown")}
            sx={{ color: (theme) => theme.palette.primary.main }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <Divider />
      <DialogContent>{children}</DialogContent>
      <Divider />
      {!hideActions ? <DialogActions>{actions}</DialogActions> : null}
    </Dialog>
  );
}
