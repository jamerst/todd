import React, { useState, useCallback } from "react"
import { Dialog, DialogActions, DialogTitle, DialogContent, TextField, Button, FormControl, Select, MenuItem, InputLabel, Grid, Box, Collapse } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import DateFnsUtils from "@date-io/date-fns"

import useResponsive from "../../hooks/useResponsive";
import AuthUtils from "../../utils/AuthUtils";

type CreateRecordDialogProps = {
  open: boolean,
  onSuccess: Function,
  onExit: Function,
  id: string,
  latestRecordType: number
}

type RecordData = {
  itemId: string,
  type: number,
  description: string,
  date: Date
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      '& .MuiFormControl-root': {
        marginBottom: theme.spacing(2),
      },
    },
  }),
);

export const CreateRecordDialog = ({ open, onSuccess, onExit, id, latestRecordType }: CreateRecordDialogProps) => {
  const [data, setData] = useState<RecordData>({
    itemId: id,
    type: latestRecordType === 0 ? 1 : 0,
    description: "",
    date: new Date()
  });
  const [error, setError] = useState("");

  const createRecord = useCallback(async () => {
    const response = await AuthUtils.authFetch("/api/item/CreateRecord", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    if (response.ok) {
      onSuccess();
      setData({
        itemId: id,
        type: data.type === 0 ? 1 : 0,
        description: "",
        date: new Date()
      });
    } else {
      setError("Failed to create record");
    }
  }, [data, onSuccess, id]);

  const classes = useStyles();
  const r = useResponsive();

  return (
    <Dialog open={open} aria-labelledby="dialog-title" maxWidth="sm" fullWidth fullScreen={r({ xs: true, md: false })}>
      <DialogTitle id="dialog-title">Create Item Record</DialogTitle>
      <form className={classes.form} onSubmit={(e) => { e.preventDefault(); createRecord(); }}>
        <DialogContent>
          <Collapse in={error !== ""}>
            <Box mb={2}>
              <Alert severity="error" variant="filled">{error}</Alert>
            </Box>
          </Collapse>
          <TextField
            value={data.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, description: e.target.value })}
            multiline
            rows={8}
            label="Description"
            fullWidth
            variant="filled"
            required
          />

          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="filled">
                <InputLabel id="select-type-label">Record Type</InputLabel>
                <Select
                  labelId="select-type-label"
                  label="Type"
                  fullWidth
                  required
                  value={data.type}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                    setData({ ...data, type: parseInt(e.target.value as string, 10) })
                  }
                >
                  <MenuItem value={0}>Return</MenuItem>
                  <MenuItem value={1}>Remove</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  fullWidth
                  variant="inline"
                  inputVariant="filled"
                  required
                  disableFuture
                  label="Date"
                  format="dd/MM/yyyy"
                  value={data.date}
                  onChange={(d: Date | null) => setData({...data, date: d ? d : new Date()})}/>
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => onExit()}>Close</Button>
          <Button color="primary" variant="contained" type="submit">Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateRecordDialog;