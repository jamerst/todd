import React from "react";
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Typography, Chip } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { LocationOn, BrokenImage } from '@material-ui/icons';

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
  }
}));

const typeString = (type: number): string => {
  switch (type) {
    case 0: return "Cable"
    case 1: return "Consumables"
    case 2: return "Construction"
    case 3: return "Furnishings"
    case 4: return "Gel"
    case 5: return "Lighting"
    case 6: return "Other"
    case 7: return "Prop"
    case 8: return "Sound"
    case 9: return "Tool"
    default: return "Unknown"
  }
}

export const ItemResult = ({ item }: ItemResultProps) => {
  const classes = useStyles();

  return (
    <Grid container item xs={12} sm={6} md={4}>
      <Card className={classes.card}>
        <CardActionArea>
          {item.imageId ?
            <CardMedia
              image={`/api/image/GetImage/${item.imageId}`}
              title="Item image"
              className={classes.itemImage}
            />
            :
            <Grid container spacing={2} direction="column" justify="center" alignItems="center" className={classes.noItemImage}>
              <BrokenImage className={classes.noImageIcon} />
              <Typography variant="h6">No Image Available</Typography>
            </Grid>
          }
          <CardContent>
            <Typography variant="h5">{item.name}</Typography>
            <Typography variant="body1" color="textSecondary">{item.description}</Typography>
            <Box mt={1}>
              <Grid container spacing={1} justify="flex-start">
                <Grid item>
                  <Chip
                    label={typeString(item.type)}
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
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default ItemResult;