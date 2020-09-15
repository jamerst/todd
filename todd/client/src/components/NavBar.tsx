import React, { useState, Fragment } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  AppBar,
  Grid,
  IconButton,
  Menu, MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  AccountCircle,
  BrightnessHigh,
  Brightness2
} from '@material-ui/icons';
import AuthUtils from '../utils/AuthUtils';
import { Link } from 'react-router-dom';

const styles = makeStyles((theme: Theme) => createStyles({
  icon: {
    color: "inherit"
  },
  link: {
    color: "inherit",
    textDecoration: "none"
  },
  toolbar: {
    marginBottom: theme.spacing(2)
  }
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
      <Tooltip title="User options">
        <IconButton
          aria-label="User options"
          className={classes.icon}
          onClick={(e) => setUserMenu(e.currentTarget)}
        >
          <AccountCircle />
        </IconButton>
      </Tooltip>

      <Menu open={Boolean(userMenu)} anchorEl={userMenu} onClose={() => setUserMenu(null)}>
        {AuthUtils.canWrite() ? (<MenuItem><Link className={classes.link} to="/account">My Account</Link></MenuItem>) : null}
        {AuthUtils.isAdmin() ? (<MenuItem><Link className={classes.link} to="/admin">Admin Settings</Link></MenuItem>) : null}
        <MenuItem onClick={() => logout()}>Logout</MenuItem>
      </Menu>
    </Fragment>
  );
}

export const NavBar = ({ darkMode, setDarkMode }: NavBarProps) => {
  const classes = styles();

  return (
    <Fragment>
      <AppBar>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Typography variant="h5">
              <Link to="/" className={classes.link}>Todd</Link>
            </Typography>
            <Grid item>
              <Tooltip title="Toggle theme">
                <IconButton
                  aria-label="Theme toggle"
                  className={classes.icon}
                  onClick={() => { setDarkMode(!darkMode); localStorage.setItem("theme", darkMode ? "light" : "dark") }}
                >
                  {darkMode ? <BrightnessHigh /> : <Brightness2 />}
                </IconButton>
              </Tooltip>

              <UserMenu />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Toolbar className={classes.toolbar} />
    </Fragment>
  );
}

export default NavBar;