import React, { useState, Fragment } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import {
  AppBar,
  CssBaseline,
  IconButton,
  Menu, MenuItem,
  Toolbar,
  Typography,
  Grid
} from '@material-ui/core';
import {
  AccountCircle,
  BrightnessHigh,
  Brightness2
} from '@material-ui/icons';
import AuthUtils from '../utils/Auth';

const styles = makeStyles(() => createStyles({
  icon: {
    color: "inherit"
  },
}))

type NavBarProps = {
  darkMode: boolean,
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

const UserMenu = () => {
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
        className={classes.icon}
        onClick={(e) => setUserMenu(e.currentTarget)}
      >
        <AccountCircle />
      </IconButton>

      <Menu open={Boolean(userMenu)} anchorEl={userMenu} onClose={() => setUserMenu(null)}>
        {AuthUtils.canWrite() ? (<MenuItem>My Account</MenuItem>) : null}
        {AuthUtils.isAdmin() ? (<MenuItem>Admin Settings</MenuItem>) : null}
        <MenuItem onClick={() => logout()}>Logout</MenuItem>
      </Menu>
    </Fragment>
  );
}

export const NavBar = ({ darkMode, setDarkMode }: NavBarProps) => {
  const classes = styles();

  return (
    <Fragment>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Typography variant="h5">Todd</Typography>
            <Grid item>
              <IconButton
                aria-label="Theme toggle"
                className={classes.icon}
                onClick={() => { setDarkMode(!darkMode); localStorage.setItem("theme", darkMode ? "light" : "dark") }}
              >
                {darkMode ? <BrightnessHigh /> : <Brightness2 />}
              </IconButton>

              <UserMenu />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Fragment>
  );
}

export default NavBar;