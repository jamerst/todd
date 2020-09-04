import React, { useEffect, useState, useCallback, Fragment } from "react"
import { useParams, Link } from "react-router-dom"
import { Grid, CircularProgress, Typography, Container, Paper, Box, Chip, Fab } from "@material-ui/core"
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent, TimelineOppositeContent } from "@material-ui/lab"
import { Help, Create, CallMade, CallReceived, LocationOn, Edit } from "@material-ui/icons"
import { blue } from "@material-ui/core/colors"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"

import ItemImageGallery from "./ItemImageGallery"
import AuthUtils from "../utils/AuthUtils"
import ItemUtils from "../utils/ItemUtils"
import EditItemDialog from "./EditItemDialog"

type Record = {
  username: string,
  type: number,
  description: string,
  date: string
}

type ItemDetails = {
  name: string,
  type: number,
  description: string,
  locationId: string,
  locationName: string,
  quantity: number,
  creatorName: string,
  created: string,
  imageIds: string[],
  records: Record[]
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  paper: {
    maxWidth: "30em",
    padding: theme.spacing(1)
  },
  opposite: {
    flex: "unset",
    paddingLeft: 0
  },
  description: {
    whiteSpace: "pre-wrap"
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 100
  },
}))

const Item = () => {
  const classes = useStyles();
  const { id } = useParams();

  const [data, setData] = useState<ItemDetails>({
    name: "",
    type: -1,
    description: "",
    locationId: "",
    locationName: "",
    quantity: 0,
    creatorName: "",
    created: "",
    imageIds: [],
    records: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [editItemOpen, setEditItemOpen] = useState<boolean>(false);

  const fetchDetails = useCallback(async () => {
    const response = await AuthUtils.authFetch(`/api/item/GetItem/${id}`);

    if (response.ok) {
      const itemData = await response.json();
      setData(itemData);
    } else if (response.status === 404) {
      setNotFound(true);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <Grid container alignItems="center" justify="center">
        <CircularProgress />
      </Grid>
    )
  }

  if (notFound) {
    return (
      <Grid container alignItems="center" justify="center" direction="column">
        <Help style={{ color: blue[700], fontSize: 150 }} />
        <Typography variant="h3">Item Not Found</Typography>

        <Typography variant="h5"><Link to="/">Return Home</Link></Typography>
      </Grid>
    )
  }

  return (
    <Fragment>
      <Container>
        <Box mt={2}>
          <Typography variant="h3">{data.name}</Typography>
          <Grid container>
            <Grid item xs={12} md={6}>
              <Grid container item spacing={1} justify="flex-start">
                <Grid item>
                  <Chip
                    label={ItemUtils.typeString(data.type)}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    label={data.locationName}
                    icon={<LocationOn />}
                  />
                </Grid>
              </Grid>

              <Box m={1}>
                <Typography variant="h6">
                  <strong>Quantity:</strong> {data.quantity}
                </Typography>
              </Box>

              <Box m={1}>
                <Typography variant="h6"><strong>Description:</strong></Typography>
                <Typography variant="body1" className={classes.description}>{data.description}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <ItemImageGallery imageIds={data.imageIds} setImageIds={(value) => setData({...data, imageIds: value})} itemId={id} />
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h4">Item History</Typography>
        <Timeline>
          {data.records.map(r => (
            <TimelineItem>
              <TimelineOppositeContent className={classes.opposite}>
                <Typography variant="body2">{new Date(r.date).toLocaleDateString()}</Typography>
                <em>{r.username}</em>
              </TimelineOppositeContent>
              <TimelineSeparator>
                {r.type === 0 ?
                  (<TimelineDot color="primary"><CallReceived /></TimelineDot>)
                  :
                  (<TimelineDot color="secondary"><CallMade /></TimelineDot>)
                }
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Paper className={classes.paper}>
                  <Typography variant="h6">Item {r.type === 0 ? "Returned" : "Removed"}</Typography>
                  <Typography>{r.description}</Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}

          <TimelineItem>
            <TimelineOppositeContent className={classes.opposite}>
              <Typography variant="body2">{new Date(data.created).toLocaleDateString()}</Typography>
              <em>{data.creatorName}</em>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>
                <Create />
              </TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Paper className={classes.paper}>
                <Typography variant="h6">Item Created</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Container>

      <Fab color="secondary" aria-label="add" className={classes.fab} onClick={(_) => setEditItemOpen(true)} disabled={!AuthUtils.canWrite()}>
        <Edit />
      </Fab>

      <EditItemDialog
        open={editItemOpen}
        onSuccess={() => { setEditItemOpen(false); fetchDetails(); }}
        onExit={() => setEditItemOpen(false)}
        currentData={{
          id: id,
          name: data.name,
          description: data.description,
          type: data.type,
          locationId: data.locationId,
          location: null,
          quantity: data.quantity
        }}
      />
    </Fragment>
  );
}

export default Item;