import React, { useState, useRef, useCallback } from "react"
import { Grid, Typography, Paper, GridList, GridListTile, Fab } from "@material-ui/core"
import { BrokenImage, NavigateNext, NavigateBefore } from "@material-ui/icons"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

type ItemImageGalleryProps = {
  imageIds: string[]
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  noItemImage: {
    height: "30em",
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.secondary,
    margin: 0,
  },
  noImageIcon: {
    fontSize: theme.typography.h3.fontSize
  },
  imageContainer: {
    width: "100%",
    height: "40em",
    display: "grid",
    justifyContent: "center",
    gridTemplateColumns: "33% 33% 33%",
    gridTemplateRows: "33% 33% 33%"
  },
  itemImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    gridRow: "1/-1",
    gridColumn: "1/-1",
    alignSelf: "center",
    justifySelf: "center",
    objectFit: "contain",
    padding: theme.spacing(2),
  },
  imageButton: {
    zIndex: 1000,
    gridRow: 2,
    "&[data-action='prev']": {
      marginLeft: theme.spacing(3),
      gridColumn: "1",
      justifySelf: "start",
      alignSelf: "center"
    },
    "&[data-action='next']": {
      marginRight: theme.spacing(3),
      gridColumn: "3",
      justifySelf: "end",
      alignSelf: "center"
    },
    "&:disabled": {
      backgroundColor: grey[500]
    }
  },
  preview: {
    cursor: "pointer",
    filter: "brightness(.6)",
    transition: ".2s",
    "&[data-current='true']": {
      filter: "none"
    }
  },
  gridList: {
    flexWrap: "nowrap",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.selected,
  },
}));

const ItemImageGallery = ({ imageIds }: ItemImageGalleryProps) => {
  const classes = useStyles();
  const previewContainer = useRef<HTMLUListElement>(null);

  const [current, setCurrent] = useState<number>(0);

  const changeImage = useCallback((i: number) => {
    setCurrent(i);

    if (previewContainer.current !== null) {
      // for some stupid reason, scrollIntoView won't work for the first or last element, so scroll to end manually
      if (i === 0) {
        previewContainer.current.scrollTo({ left: 0, behavior: "smooth" });
      } else if (i === imageIds.length - 1) {
        previewContainer.current.scrollTo({ left: previewContainer.current.scrollWidth, behavior: "smooth" });
      } else {
        previewContainer.current.children[i].scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [previewContainer, imageIds.length])

  if (imageIds.length === 0) {
    return (
      <Grid container direction="column" justify="center" alignItems="center" className={classes.noItemImage}>
        <BrokenImage className={classes.noImageIcon} />
        <Typography variant="h6">No Images Available</Typography>
      </Grid>
    )
  }

  return (
    <Paper>
      <div className={classes.imageContainer}>
        <img src={`/api/image/GetImage/${imageIds[current]}`} className={classes.itemImage} alt={`Number ${current + 1}`} />
        <Fab
          color="primary"
          size="small"
          className={classes.imageButton}
          data-action="prev"
          onClick={() => changeImage(current - 1)}
          disabled={current === 0}
        >
          <NavigateBefore />
        </Fab>
        <Fab
          color="primary"
          size="small"
          className={classes.imageButton}
          data-action="next"
          onClick={() => changeImage(current + 1)}
          disabled={current === imageIds.length - 1}
        >
          <NavigateNext />
        </Fab>
      </div>
      <GridList className={classes.gridList} cols={4} style={{ margin: 0 }} ref={previewContainer}>
        {imageIds.map((image, index) => (
          <GridListTile onClick={() => changeImage(index)} key={`preview-img-${image}`}>
            <img src={`/api/image/GetImage/${image}`} className={classes.preview} data-current={current === index} alt={`Preview ${index + 1}`} />
          </GridListTile>)
        )}
      </GridList>
    </Paper>
  );
}

export default ItemImageGallery;