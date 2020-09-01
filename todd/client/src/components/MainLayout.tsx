import React from "react"
import { Grid } from "@material-ui/core"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"

import Footer from "./Footer"
import NavBar from "./NavBar"

type LayoutProps = {
  darkMode: boolean,
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    minHeight: "100vh"
  },
  pageContent: {
    flexGrow: 1
  }
}))

const MainLayout = (props: React.PropsWithChildren<LayoutProps>) => {
  const classes = useStyles();

  return (
    <Grid container direction="column" className={classes.container}>
      <NavBar darkMode={props.darkMode} setDarkMode={props.setDarkMode} />
      <div className={classes.pageContent}>
        {props.children}
      </div>
      <Footer />
    </Grid>
  )
}

export default MainLayout