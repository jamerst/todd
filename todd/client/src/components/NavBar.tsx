import React from 'react';
import { fade, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  AppBar,
  IconButton,
  InputBase,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  AccountCircle,
  Search,
  CallMissedSharp
} from '@material-ui/icons';
import { relative } from 'path';

const styles = makeStyles((theme: Theme) => createStyles({
  bar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  right: {
    display: "flex",
    flexDirection: "row"
  },
  search: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  account: {
    color: "inherit"
  },
}))

export const NavBar = () => {
  const classes = styles();

  return (
    <AppBar>
      <Toolbar className={classes.bar}>
        <Typography variant="h5">Todd</Typography>
        <div className={classes.right}>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <Search/>
            </div>
            <InputBase
              placeholder="Search..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
            />
          </div>
          <IconButton aria-label="My account" className={classes.account}>
            <AccountCircle/>
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;