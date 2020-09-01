import React, { Fragment, useState, useEffect, useCallback } from "react"
import { useLocation, useHistory } from "react-router"
import { CircularProgress, Container, Box, Grid, Card, Typography, Fab, Snackbar } from "@material-ui/core"
import { Pagination, Alert } from "@material-ui/lab"
import { Add } from "@material-ui/icons"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"

import AddItemDialog from "./AddItemDialog"
import ItemResult, { ItemResultData } from "./ItemResult"
import ItemSearchForm from "./ItemSearchForm"
import useResponsive from "../hooks/useResponsive"
import AuthUtils from "../utils/AuthUtils"
import SearchUtils, { Location, SearchParams } from "../utils/SearchUtils"


const useStyles = makeStyles((theme: Theme) => createStyles({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 100
  },
  container: {
    minHeight: "100vh",
    position: "relative"
  },
  pageContent: {
    paddingBottom: "10em"
  }
}))

export const Home = () => {
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
  const [addItemOpen, setAddItemOpen] = useState<boolean>(false);
  const [successSnack, setSuccessSnack] = useState<string>("");

  const location = useLocation();
  const history = useHistory();
  const r = useResponsive();
  const classes = useStyles();

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
        history.push(`${location.pathname}?${SearchUtils.paramsToQueryString(params)}`);
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
      setParams(SearchUtils.queryStringToParams(location.search));
    }
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  return (
    <Fragment>
      <Box mt={2}>
        <Container>
          <Grid container direction="column" spacing={2}>
            <Card>
              <Box p={3}>
                <ItemSearchForm
                  params={params}
                  setParams={setParams}
                  setLoading={setLoading}
                  setReady={setReady}
                  locations={locations}
                />
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
                        <Grid container direction={r({ xs: "column", md: "row" })} justify="space-between" alignItems="center">
                          <Typography variant="h5">{numResults} Results</Typography>
                          <Pagination
                            color="secondary"
                            count={Math.ceil(numResults / 25)}
                            page={params.pageNum}
                            onChange={(_, value: number) => { setParams({ ...params, pageNum: value }); setReady(true); }}
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
                            onChange={(_, value: number) => { setParams({ ...params, pageNum: value }); setReady(true); }}
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

      <Fab color="secondary" aria-label="add" className={classes.fab} onClick={(_) => setAddItemOpen(true)} disabled={!AuthUtils.canWrite()}>
        <Add />
      </Fab>
      <AddItemDialog
        open={addItemOpen}
        onSuccess={() => { setAddItemOpen(false); setReady(true); setSuccessSnack("Successfully added item") }}
        onExit={() => setAddItemOpen(false)}
        locations={locations}
      />

      <Snackbar
        open={successSnack !== ""}
        autoHideDuration={5000}
        onClose={() => setSuccessSnack("")}
      >
        <Alert onClose={() => setSuccessSnack("")} severity="success" variant="filled" elevation={6}>{successSnack}</Alert>
      </Snackbar>
    </Fragment>
  );
}

export default Home;