import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { CircularProgress, Container, Box, Grid, Card, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Button } from "@material-ui/core";
import NavBar from './NavBar';
import ItemResult, { ItemResultData } from "./ItemResult";
import AuthUtils from '../utils/Auth';
import { useLocation, useHistory } from 'react-router';
import { Pagination } from '@material-ui/lab';
import useResponsive from "../hooks/useResponsive";

type HomeProps = {
  darkMode: boolean,
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

type SearchParams = {
  name: string,
  type: number,
  locationId: string,
  pageNum: number
}

interface Location {
  id: string,
  name: string
}

const paramsToQueryString = (p: SearchParams) => {
  let params = [];

  if (p.name !== "") {
    params.push(`name=${p.name}`);
  }
  if (p.type !== -1) {
    params.push(`type=${p.type}`);
  }
  if (p.locationId !== "") {
    params.push(`locationId=${p.locationId}`);
  }
  if (p.pageNum !== 1) {
    params.push(`pageNum=${p.pageNum}`);
  }

  return params.join("&");
}

const queryStringToParams = (s: string) => {
  const p = new URLSearchParams(s);
  return {
    name: p.get("name") ?? "",
    type: parseInt(p.get("type") ?? "-1", 10),
    locationId: p.get("locationId") ?? "",
    pageNum: parseInt(p.get("pageNum") ?? "1", 10)
  }
}

export const Home = ({ darkMode, setDarkMode }: HomeProps) => {
  const [params, setParams] = useState<SearchParams>({
    name: "",
    type: -1,
    locationId: "",
    pageNum: 1
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<ItemResultData[]>([]);
  const [numResults, setNumResults] = useState<number>(0);
  const [ready, setReady] = useState<boolean>(false);

  const location = useLocation();
  const history = useHistory();
  const r = useResponsive();

  const fetchSearchResults = useCallback(async () => {
    if (ready) {
      const response = await AuthUtils.authFetch("/api/item/SearchItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (response.ok) {
        const data = await response.json();

        setResults(data.results);
        setNumResults(data.count);
        setLoading(false);
        setReady(false);
        history.push(`${location.pathname}?${paramsToQueryString(params)}`);
      }
    }
  }, [params, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  // history and location.pathname are not dependencies otherwise an infinite loop is created

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

    if (location.search !== "") {
      setParams(queryStringToParams(location.search));
    }
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  return (
    <Fragment>
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode}/>
      <Box mt={2}>
        <Container>
          <Grid container direction="column" spacing={2}>
            <Card>
              <Box p={3}>
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
              </Box>
            </Card>

            <Box my={2}>
              {loading
                ? <Grid container alignItems="center" justify="center">
                  <CircularProgress />
                </Grid>
                : <Fragment>
                  {numResults > 0
                    ? <Fragment>
                      <Box mb={1}>
                        <Grid container direction={r({xs: "column", md: "row"})} justify="space-between" alignItems="center">
                          <Typography variant="h5">{numResults} Results</Typography>
                          <Pagination
                            color="secondary"
                            count={Math.ceil(numResults / 25)}
                            page={params.pageNum}
                            onChange={(_, value: number) => {setParams({...params, pageNum: value}); setReady(true);}}
                          />
                        </Grid>
                      </Box>
                      <Grid container spacing={2}>
                        {results.map((i: ItemResultData) => (
                          <ItemResult item={i} key={`result-${i.id}`} />
                        ))}
                      </Grid>
                      <Box mt={2}>
                        <Grid container justify="center">
                          <Pagination
                            color="secondary"
                            count={Math.ceil(numResults / 25)}
                            page={params.pageNum}
                            onChange={(_, value: number) => {setParams({...params, pageNum: value}); setReady(true);}}
                          />
                        </Grid>
                      </Box>
                    </Fragment>
                    : <Box textAlign="center">
                      <Typography variant="h6">
                        No Results
                      </Typography>
                    </Box>
                  }
                </Fragment>
              }
            </Box>
          </Grid>
        </Container>
      </Box>
    </Fragment>
  );
}

export default Home;