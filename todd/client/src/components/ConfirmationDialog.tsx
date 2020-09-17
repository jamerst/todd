import React from "react"
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@material-ui/core"

type ConfirmationDialogProps = {
  open: boolean,
  onConfirm: Function,
  onReject: Function,
  title: string,
  description: string,
  primaryLabel: string
}

const ConfirmationDialog = ({ open, onConfirm, onReject, title, description, primaryLabel }: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onClose={() => onReject()} aria-labelledby="alert-title" aria-describedby="alert-desc">
      <DialogTitle id="alert-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-desc">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onReject()} color="primary">Cancel</Button>
        <Button onClick={() => onConfirm()} autoFocus color="primary">{primaryLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog;