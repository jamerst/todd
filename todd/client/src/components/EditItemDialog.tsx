import React, { useState, useMemo, useCallback, useEffect } from "react"
import { Dialog, DialogActions, DialogTitle, DialogContent, TextField, Button, FormControl, Select, MenuItem, InputLabel, Grid, Box, Collapse } from "@material-ui/core"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"

import { Location } from "../utils/SearchUtils";
import { Alert, Autocomplete, createFilterOptions } from "@material-ui/lab";
import useResponsive from "../hooks/useResponsive";
import AuthUtils from "../utils/AuthUtils";

type EditItemDialogProps = {
  open: boolean
  onSuccess: Function,
  onExit: Function
  currentData: ItemData
}

type ItemData = {
  id: string,
  name: string,
  description: string,
  type: number,
  locationId: string | null,
  location: { id: string | null, name: string } | null,
  quantity: number
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

export const EditItemDialog = ({ open, onSuccess, onExit, currentData }: EditItemDialogProps) => {
  const [data, setData] = useState<ItemData>(currentData);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState("");

  const locationOptions: LocationOptionType[] = useMemo(() => locations.map(l => {
    return {
      name: l.name,
      id: l.id,
      displayName: l.name
    }
  }), [locations]);

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await AuthUtils.authFetch("/api/location/GetLocations", {
        method: "GET"
      });

      if (response.ok) {
        setLocations(await response.json());
      }
    }

    fetchLocations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateItem = useCallback(async () => {
    const response = await AuthUtils.authFetch("/api/item/Update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      onSuccess();
    } else {
      setError("Unknown error creating item");
    }
  }, [data, onSuccess]);

  const classes = useStyles();
  const r = useResponsive();

  return (
    <Dialog open={open} aria-labelledby="dialog-title" maxWidth="sm" fullWidth fullScreen={r({ xs: true, md: false })}>
      <DialogTitle id="dialog-title">Edit Item Details</DialogTitle>
      <form className={classes.form} onSubmit={(e) => { e.preventDefault(); updateItem(); }}>
        <DialogContent>
          <Collapse in={error !== ""}>
            <Box mb={2}>
              <Alert severity="error" variant="filled">{error}</Alert>
            </Box>
          </Collapse>
          <TextField
            value={data.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, name: e.target.value })}
            autoFocus
            label="Item Name"
            fullWidth
            variant="filled"
            required
          />
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
                variant="filled"
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
            value={locationOptions.find(l => l.id === data.locationId)}
            getOptionLabel={l => l.name ?? "(Unknown)"}
            renderOption={l => l.displayName ?? "(Unknown)"}
            renderInput={(props) => <TextField {...props} label="Location" variant="filled" required />}
            onChange={(_, value) => {
              if (value === null) {
                setData({ ...data, location: null, locationId: null });
              } else if ((value as LocationOptionType).id !== "") {
                setData({ ...data, location: null, locationId: (value as LocationOptionType).id });
              } else if ((value as LocationOptionType).id === "")
                setData({ ...data, location: { id: null, name: (value as LocationOptionType).name }, locationId: null });
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              if (params.inputValue !== ""
                && locationOptions.findIndex(l => l.name.toLowerCase() === params.inputValue.toLowerCase()) === -1) {
                filtered.push({
                  name: params.inputValue,
                  id: "",
                  displayName: `Add Location "${params.inputValue}"`
                })
              }

              return filtered;
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => onExit()}>Close</Button>
          <Button color="primary" variant="contained" type="submit">Save</Button>
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

export default EditItemDialog;