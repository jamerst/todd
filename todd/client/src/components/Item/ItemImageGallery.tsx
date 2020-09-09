import React, { useState, useRef, useCallback, Fragment } from "react"
import { Grid, Typography, Paper, GridList, GridListTile, Fab, IconButton, GridListTileBar, Button, Tooltip } from "@material-ui/core"
import { BrokenImage, NavigateNext, NavigateBefore, Add, Clear } from "@material-ui/icons"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"

import RemoveImageAlertDialog from "./RemoveImageAlertDialog"
import AuthUtils from "../../utils/AuthUtils"

type ItemImageGalleryProps = {
  imageIds: string[],
  setImageIds: (value: string[]) => void,
  itemId: string
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
  tileBar: {
    color: theme.palette.common.white,
    height: "auto"
  }
}));

const ItemImageGallery = ({ imageIds, setImageIds, itemId }: ItemImageGalleryProps) => {
  const classes = useStyles();
  const preview = useRef<HTMLUListElement>(null);

  const [current, setCurrent] = useState<number>(0);
  const [deleteIndex, setDeleteIndex] = useState<number>(-1);

  const changeImage = useCallback((i: number) => {
    setCurrent(i);

    if (preview.current !== null) {
      // can't use scrollIntoView as that scrolls the entire page, which is horrible on mobile
      // scrollIntoView also won't work for the first or last image, no idea why
      const elemStart = preview.current.children[0].clientWidth * i;
      const elemEnd = preview.current.children[0].clientWidth * (i + 1);

      if (preview.current.scrollLeft >= elemStart
        || preview.current.scrollLeft + preview.current.clientWidth <= elemEnd) {
        preview.current.scrollTo({ left: preview.current.children[0].clientWidth * i, behavior: "smooth" })
      }
    }
  }, [preview]);

  const deleteImage = useCallback(async (i: number) => {
    const response = await AuthUtils.authFetch(`/api/image/Delete/${imageIds[i]}`, {
      method: "DELETE"
    });

    if (response.ok) {
      if (imageIds.length === 1) {
        setCurrent(0);
      } else if (i === imageIds.length - 1) {
        setCurrent(i - 1);
      }

      let newIds = [...imageIds];
      newIds.splice(i, 1);
      setImageIds(newIds);
    }
  }, [imageIds, setImageIds]);

  const addImages = useCallback(async (files: FileList | null) => {
    if (files !== null) {
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const response = await AuthUtils.authFetch(`/api/item/AddImages/${itemId}`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const newIds = await response.json();
        setImageIds([...imageIds, ...newIds]);
      }
    }
  }, [itemId, imageIds, setImageIds]);

  if (imageIds.length === 0) {
    return (
      <Grid container direction="column" justify="center" alignItems="center" className={classes.noItemImage}>
        <BrokenImage className={classes.noImageIcon} />
        <Typography variant="h6">No Images Available</Typography>
        {AuthUtils.canWrite() ?
          <Fragment>
            <input id="item-images" type="file" accept="image/*" multiple hidden onChange={e => addImages(e.target.files)} />
            <label htmlFor="item-images">
              <Button color="primary" variant="contained" size="small" component="span">Upload Images</Button>
            </label>
          </Fragment>
          : null}
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

      <GridList className={classes.gridList} cols={4} style={{ margin: 0 }} ref={preview}>
        {imageIds.map((image, index) => (
          <GridListTile onClick={() => changeImage(index)} key={`preview-img-${image}`}>
            <img src={`/api/image/GetImage/${image}`} className={classes.preview} data-current={current === index} alt={`Preview ${index + 1}`} />
            {AuthUtils.canWrite() ?
              <GridListTileBar className={classes.tileBar}
                actionIcon={
                  <Tooltip title="Delete image">
                    <IconButton color="inherit" size="small" onClick={() => setDeleteIndex(index)}><Clear /></IconButton>
                  </Tooltip>}
              /> : null}
          </GridListTile>)
        )}

        {AuthUtils.canWrite() ?
          (<GridListTile>
            <Grid container justify="center" alignItems="center" style={{ height: "100%" }}>
              <input id="item-images" type="file" accept="image/*" multiple hidden onChange={e => addImages(e.target.files)} />
              <label htmlFor="item-images">
                <Tooltip title="Add images">
                  <IconButton color="primary" component="span">
                    <Add />
                  </IconButton>
                </Tooltip>
              </label>
            </Grid>
          </GridListTile>)
          :
          null
        }
      </GridList>

      <RemoveImageAlertDialog
        open={deleteIndex !== -1}
        onConfirm={() => { deleteImage(deleteIndex); setDeleteIndex(-1); }}
        onReject={() => setDeleteIndex(-1)}
      />
    </Paper>
  );
}

export default ItemImageGallery;