import React, { useState, Fragment } from 'react';
import { fade, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  AppBar,
  CssBaseline,
  IconButton,
  InputBase,
  Menu, MenuItem,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  AccountCircle,
  Search
} from '@material-ui/icons';
import AuthUtils from '../utils/Auth';

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

type NavBarProps = {
  canWrite: boolean,
  admin: boolean
}

const UserMenu = ({ canWrite, admin }: NavBarProps) => {
  const classes = styles();

  const [userMenu, setUserMenu] = useState<null | HTMLElement>(null);

  const logout = () => {
    setUserMenu(null);
    AuthUtils.logout();
  }

  return (
    <Fragment>
      <IconButton
        aria-label="User options"
        className={classes.account}
        onClick={(e) => setUserMenu(e.currentTarget)}
      >
        <AccountCircle />
      </IconButton>
      <Menu open={Boolean(userMenu)} anchorEl={userMenu} onClose={() => setUserMenu(null)}>
        {canWrite ? (<MenuItem>My Account</MenuItem>) : null}
        {admin ? (<MenuItem>Admin Settings</MenuItem>) : null}
        <MenuItem onClick={() => logout()}>Logout</MenuItem>
      </Menu>
    </Fragment>
  );
}

export const NavBar = ({ canWrite, admin }: NavBarProps) => {
  const classes = styles();

  return (
    <Fragment>
      <CssBaseline/>
      <AppBar>
        <Toolbar className={classes.bar}>
          <Typography variant="h5">Todd</Typography>
          <div className={classes.right}>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <Search />
              </div>
              <InputBase
                placeholder="Search..."
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
              />
            </div>
            <UserMenu canWrite={canWrite} admin={admin} />
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Fragment>
  );
}

export default NavBar;