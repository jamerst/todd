import React from "react";
import { Link } from "react-router-dom"
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Typography, Chip } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { LocationOn, BrokenImage } from '@material-ui/icons';

import ItemUtils from "../utils/ItemUtils"

export interface ItemResultData {
  id: string,
  name: string;
  type: number;
  description: string;
  locationName: string;
  imageId: string;
}

type ItemResultProps = {
  item: ItemResultData
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  card: {
    width: "100%"
  },
  growGrid: {
    flexGrow: 1
  },
  height100: {
    height: "100%"
  },
  itemImage: {
    height: "30em"
  },
  noItemImage: {
    height: "30em",
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.secondary,
    margin: 0,
  },
  noImageIcon: {
    fontSize: theme.typography.h3.fontSize
  },
  description: {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    whiteSpace: "pre-wrap"
  }
}));

const ItemResult = ({ item }: ItemResultProps) => {
  const classes = useStyles();

  return (
    <Grid container item xs={12} sm={6} md={4}>
      <Card className={classes.card}>
        <CardActionArea className={classes.height100} href={`/item/${item.id}`}>
          <Grid container direction="column" className={classes.height100}>
            {item.imageId ?
              <CardMedia
                image={`/api/image/GetImage/${item.imageId}`}
                title="Item image"
                className={classes.itemImage}
              />
              :
              <Grid container direction="column" justify="center" alignItems="center" className={classes.noItemImage}>
                <BrokenImage className={classes.noImageIcon} />
                <Typography variant="h6">No Image Available</Typography>
              </Grid>
            }
            <CardContent component={Grid} container direction="column" justify="space-between" className={classes.growGrid}>
              <Grid item>
                <Typography variant="h5">{item.name}</Typography>
                <Typography variant="body1" color="textSecondary" className={classes.description}>{item.description}</Typography>
              </Grid>
              <Grid item>
                <Box mt={1}>
                  <Grid container spacing={1} justify="flex-start">
                    <Grid item>
                      <Chip
                        label={ItemUtils.typeString(item.type)}
                      />
                    </Grid>
                    <Grid item>
                      <Chip
                        label={item.locationName}
                        icon={<LocationOn />}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </CardContent>
          </Grid>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default ItemResult;