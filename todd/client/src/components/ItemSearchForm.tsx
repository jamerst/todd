import React from "react"
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Box, Button } from "@material-ui/core"
import { SearchParams, Location } from "../utils/SearchUtils"

type ItemSearchFormProps = {
  params: SearchParams,
  setParams: React.Dispatch<React.SetStateAction<SearchParams>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setReady: React.Dispatch<React.SetStateAction<boolean>>,
  locations: Location[]
}

const ItemSearchForm = ({ params, setParams, setLoading, setReady, locations }: ItemSearchFormProps) => {
  return (
    <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); setLoading(true); setReady(true); }}>
      <Grid container spacing={1} justify="flex-end">
        <Grid item xs={12} md={6}>
          <TextField
            label="Name"
            fullWidth
            value={params.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setParams({ ...params, name: e.currentTarget.value })
            }
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              fullWidth
              value={params.type}
              onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                setParams({ ...params, type: parseInt(e.target.value as string, 10) })
              }
            >
              <MenuItem value={-1}><em>Any</em></MenuItem>
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

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel shrink>Location</InputLabel>
            <Select
              fullWidth
              value={params.locationId}
              displayEmpty
              onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                setParams({ ...params, locationId: e.target.value as string })
              }
            >
              <MenuItem value={""}><em>Any</em></MenuItem>
              {locations.map((l: Location) => (<MenuItem value={l.id} key={`loc-option-${l.id}`}>{l.name}</MenuItem>))}
            </Select>
          </FormControl>
        </Grid>

        <Box mt={2}>
          <Button variant="contained" color="primary" type="submit">Search</Button>
        </Box>
      </Grid>
    </form>
  )
}

export default ItemSearchForm