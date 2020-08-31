import React, { useState, useMemo } from "react"
import { Dialog, DialogActions, DialogTitle, DialogContent, TextField, Button, FormControl, Select, MenuItem, InputLabel, Grid, Typography } from "@material-ui/core"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"

import { Location } from "../utils/SearchUtils";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import useResponsive from "../hooks/useResponsive";

type AddItemDialogProps = {
  open: boolean
  onClose: Function,
  locations: Location[]
}

type ItemData = {
  name: string,
  description: string,
  type: number,
  locationId: string | null,
  location: { id: string, name: string } | null,
  quantity: number,
  images: FileList | null
}

const filter = createFilterOptions<LocationOptionType>();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      '& .MuiFormControl-root': {
        marginBottom: theme.spacing(2),
      },
    },
  }),
);

export const AddItemDialog = ({ open, onClose, locations }: AddItemDialogProps) => {
  const [data, setData] = useState<ItemData>({
    name: "",
    description: "",
    type: 0,
    locationId: "",
    location: { id: "", name: "" },
    quantity: 1,
    images: null
  });

  const locationOptions: LocationOptionType[] = useMemo(() => locations.map(l => {
    return {
      name: l.name,
      id: l.id,
      displayName: l.name
    }
  }), [locations]);

  const classes = useStyles();
  const r = useResponsive();

  return (
    <Dialog open={open} onClose={(e, r) => onClose()} aria-labelledby="dialog-title" maxWidth="sm" fullWidth fullScreen={r({ xs: true, md: false })}>
      <DialogTitle id="dialog-title">Add New Item</DialogTitle>
      <form className={classes.form} onSubmit={(e) => {e.preventDefault(); console.log(data)}}>
        <DialogContent>
          <TextField
            value={data.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, name: e.target.value })}
            autoFocus
            label="Item Name"
            fullWidth
            variant="outlined"
            required
          />
          <TextField
            value={data.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, description: e.target.value })}
            multiline
            rows={5}
            label="Description"
            fullWidth
            variant="outlined"
            required
          />

          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="select-type-label">Type</InputLabel>
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
                  <MenuItem value={0}>Cable</MenuItem>
                  <MenuItem value={1}>Consumable</MenuItem>
                  <MenuItem value={2}>Construction</MenuItem>
                  <MenuItem value={3}>Furnishings</MenuItem>
                  <MenuItem value={4}>Gel</MenuItem>
                  <MenuItem value={5}>Lighting</MenuItem>
                  <MenuItem value={6}>Other</MenuItem>
                  <MenuItem value={7}>Prop</MenuItem>
                  <MenuItem value={8}>Sound</MenuItem>
                  <MenuItem value={9}>Tool</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                value={data.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData({ ...data, quantity: parseInt(e.target.value as string, 10) })
                }
                label="Quantity"
                fullWidth
                variant="outlined"
                type="number"
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
          </Grid>

          <Autocomplete
            options={locationOptions}
            fullWidth
            freeSolo
            getOptionLabel={l => l.name}
            renderOption={l => l.displayName}
            renderInput={(props) => <TextField {...props} label="Location" variant="outlined" required />}
            onChange={(_, value) => {
              if (value === null) {
                setData({ ...data, location: null, locationId: null });
              } else if ((value as LocationOptionType).id !== "") {
                setData({ ...data, location: null, locationId: (value as LocationOptionType).id });
              } else if ((value as LocationOptionType).id === "")
                setData({ ...data, location: { id: "", name: (value as LocationOptionType).name }, locationId: null });
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              if (params.inputValue !== "") {
                filtered.push({
                  name: params.inputValue,
                  id: "",
                  displayName: `Add "${params.inputValue}"`
                })
              }

              return filtered;
            }}
          />

          <input id="item-images" type="file" accept="image/*" multiple hidden onChange={e => setData({ ...data, images: e.target.files })} />
          <label htmlFor="item-images">
            <Button variant="contained" color="primary" component="span">Add Images</Button>
            {data.images !== null && data.images.length > 0 ?
              <Typography variant="body1">
                {data.images.length} image{data.images.length > 1 ? "s" : ""} selected
              </Typography>
            :
            <Typography variant="body1">No images selected</Typography>
            }
          </label>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => onClose()}>Close</Button>
          <Button color="primary" type="submit">Add</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

interface LocationOptionType {
  name: string;
  id: string;
  displayName: string;
}

export default AddItemDialog;