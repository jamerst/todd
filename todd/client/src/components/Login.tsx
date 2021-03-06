import React, { useState } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import { Box, Button, Container, Collapse, Grid, Card, CardContent, TextField, Typography } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab"
import AuthUtils from "../utils/AuthUtils";
import logo from "../logo.svg";

const styles = makeStyles((theme: Theme) => createStyles({
  grid: {
    minHeight: "100vh"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  logo: {
    objectFit: "contain",
    width: "100%"
  }
}))

function Login() {
  const classes = styles();
  const history = useHistory();
  const location = useLocation()

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRO, setPasswordRO] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginROErr, setLoginROErr] = useState("");

  const loginRO = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginROErr("");

    const result = await AuthUtils.loginReadonly(passwordRO);

    if (!result) {
      setLoginROErr("Incorrect password");
    } else {
      setLoginROErr("");

      const returnUrl = new URLSearchParams(location.search).get("returnUrl");
      if (returnUrl) {
        history.push(returnUrl);
      } else {
        history.push("/");
      }
    }
    return result;
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");

    const result = await AuthUtils.login(username, password);

    if (!result) {
      setLoginErr("Incorrect login details");
    } else {
      setLoginErr("");

      const returnUrl = new URLSearchParams(location.search).get("returnUrl");
      if (returnUrl) {
        history.push(returnUrl);
      } else {
        history.push("/");
      }
    }
    return result;
  };

  return (
    <Container>
      <Grid container justify="center" alignContent="center" spacing={5} className={classes.grid}>
        <Grid container item xs={6} md={3} direction="column" alignItems="center">
          <img src={logo} alt="Logo" className={classes.logo}/>
        </Grid>
        <Grid container item xs={12} direction="column" alignItems="center">
          <Typography variant="h1" align="center">TODD</Typography>
          <Typography variant="h6" align="center">Tech Organiser and Drama Database</Typography>
        </Grid>
        <Grid container item direction="row" justify="center" spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h4">Read-Only Access</Typography>
                </Box>
                <form onSubmit={loginRO}>
                  <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                    <Grid container item xs={12} md={6}>
                      <TextField type="password" label="Password" value={passwordRO} required fullWidth
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordRO(e.target.value)}
                      />
                    </Grid>

                    <Collapse in={loginROErr !== ""}>
                      <Alert severity="error" variant="filled">{loginROErr}</Alert>
                    </Collapse>

                    <Grid container item xs={8} md={3}>
                      <Button variant="contained" color="primary" fullWidth type="submit">Login</Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h4">Account Login</Typography>
                </Box>
                <form onSubmit={login}>
                  <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                    <Grid container item xs={12} md={6}>
                      <TextField label="Username" value={username} required fullWidth
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      />
                    </Grid>
                    <Grid container item xs={12} md={6}>
                      <TextField type="password" label="Password" value={password} required fullWidth
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      />
                    </Grid>

                    <Collapse in={loginErr !== ""}>
                      <Alert severity="error" variant="filled">{loginErr}</Alert>
                    </Collapse>

                    <Grid container item xs={8} md={3}>
                      <Button variant="contained" color="primary" fullWidth type="submit">Login</Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container item xs={12} direction="column" alignItems="center">
          <Typography variant="h5" align="center">Contact DC Cupboard Manager to obtain a login</Typography>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Login;