import React from "react"
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@material-ui/core"

type RemoveImageAlertDialogProps = {
  open: boolean,
  onConfirm: Function,
  onReject: Function
}

const RemoveImageAlertDialog = ({ open, onConfirm, onReject }: RemoveImageAlertDialogProps) => {
  return (
    <Dialog open={open} onClose={() => onReject()} aria-labelledby="remove-alert-title" aria-describedby="remove-alert-desc">
      <DialogTitle id="remove-alert-title">Delete Image?</DialogTitle>
      <DialogContent>
        <DialogContentText id="remove-alert-desc">
          Are you sure you want to delete this image? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onReject()} color="primary">Cancel</Button>
        <Button onClick={() => onConfirm()} autoFocus color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RemoveImageAlertDialog;