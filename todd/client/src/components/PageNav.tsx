import React from "react";
import { Button, ButtonGroup } from "@material-ui/core";
import { FirstPage, LastPage } from "@material-ui/icons";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

type PageNavProps = {
  pageCount: number,
  currentPage: number
}

const styles = makeStyles((theme: Theme) => createStyles({
  buttons: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary
  }
}));

export const PageNav = ({ pageCount, currentPage }: PageNavProps) => {
  const classes = styles();

  let pages: number[] = [];

  if (pageCount > 5) {
    if (currentPage < 3) {
      pages = [1,2,3,4,5];
    } else if (currentPage > pageCount - 2) {
      pages = [pageCount-4, pageCount-3, pageCount-2, pageCount-1, pageCount];
    } else {
      pages = [currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2]
    }
  } else {
    pages = Array.from(Array(pageCount), (_,i) => i + 1);
  }

  return (
    <ButtonGroup color="primary" size="small">
      <Button disabled={currentPage === 1} className={classes.buttons}><FirstPage/></Button>
        {pages.map(p =>
          <Button
            className={p === currentPage ? "" : classes.buttons}
            variant={p === currentPage ? "contained": "outlined"}
          >
            {p}
          </Button>
        )}
      <Button disabled={currentPage === pageCount} className={classes.buttons}><LastPage/></Button>
    </ButtonGroup>
  );
}

export default PageNav;