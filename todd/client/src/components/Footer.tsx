import React from "react"
import { AppBar, Toolbar, Grid, Typography, Box } from "@material-ui/core"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import DC from "../icons/DC"
import MTW from "../icons/MTW"
import TechCrew from "../icons/TechCrew"

const useStyles = makeStyles((theme: Theme) => createStyles({
  footer: {
    zIndex: 0,
    position: "relative",
    backgroundColor: theme.palette.primary.dark,
    "& a": {
      color: "inherit"
    }
  },
  footerIcon: {
    fontSize: theme.typography.h2.fontSize,
    "&:hover": {
      filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.7)); drop-shadow(0px 5px 8px rgba(0,0,0,0.64)); drop-shadow(0px 1px 14px rgba(0,0,0,0.62))",
    }
  }
}))

export const Footer = () => {
  const classes = useStyles();

  return (
    <AppBar className={classes.footer}>
      <Toolbar style={{ height: "100%" }}>
        <Box py={2} style={{ width: "100%", height: "100%" }}>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="h6">Todd - Warwick Drama Inventory</Typography>
              <Typography variant="body2">Version 1.0.0</Typography>

              <Box mt={1}>
                <Typography variant="body2">Created by James Tattersall, September 2020</Typography>
                <Typography variant="body2"><a href="https://github.com/jamerst/todd">Source Code</a></Typography>
              </Box>
            </Grid>

            <Grid item container direction="row" justify="center" alignItems="center" spacing={2} xs={12} md={2}>
              <Grid item><DC className={classes.footerIcon} /></Grid>
              <Grid item>
                <a target="_blank" rel="noopener noreferrer" href="https://www.musictheatrewarwick.com/">
                  <MTW className={classes.footerIcon} />
                </a>
              </Grid>
              <Grid item>
                <a target="_blank" rel="noopener noreferrer" href="http://www.warwicktechcrew.co.uk/">
                  <TechCrew className={classes.footerIcon} />
                </a>
              </Grid>
            </Grid>

            <Grid item xs={12} md={5} />
          </Grid>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Footer