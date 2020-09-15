import React, { useCallback, useEffect, useState } from "react"
import { Box, Button, Container, Collapse, Grid, Card, CardContent, TextField, Typography, CircularProgress } from "@material-ui/core";
import { Alert } from "@material-ui/lab"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import logo from "../logo.svg";
import { useHistory, useParams } from "react-router";
import AuthUtils from "../utils/AuthUtils";

const useStyles = makeStyles((theme: Theme) => createStyles({
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

const Activate = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const [activateErr, setActivateErr] = useState<string>("");

  const getUsername = useCallback(async () => {
    const response = await AuthUtils.authFetch(`/api/user/GetActivationUsername/${id}`);

    if (response.ok) {
      setUsername(await response.json());
    } else {
      history.push("/login");
    }
  }, [id]);

  const activateAccount = useCallback(async () => {
    setActivateErr("");

    if (password !== confirmPass) {
      setActivateErr("Passwords don't match");
      return;
    }

    const response = await AuthUtils.authFetch("/api/user/Activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activationId: id,
        password: password
      })
    });

    if (response.ok) {
      AuthUtils.saveTokens(await response.json());
      history.push("/");
    } else {
      setActivateErr("An error occurred when trying to activate your account");
    }
  }, [id, password, confirmPass])

  useEffect(() => {
    getUsername()
  }, [getUsername]);

  if (username === ""){
    return (
      <Grid container justify="center" alignItems="center" className={classes.grid}>
        <CircularProgress />
      </Grid>
    )
  }

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
        <Grid container item direction="row" justify="center">
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box textAlign="center" mb={2}>
                  <Typography variant="h4">Account Registration</Typography>
                  <Typography variant="body1">Please choose a password to complete your account registration.</Typography>
                </Box>
                <form onSubmit={(e) => {e.preventDefault(); activateAccount()}}>
                  <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                    <Grid container item xs={12} md={6}>
                      <TextField label="Username" value={username} disabled required fullWidth />
                    </Grid>

                    <Grid container item xs={12} md={6}>
                      <TextField type="password" label="Password" value={password} required fullWidth
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      />
                    </Grid>
                    <Grid container item xs={12} md={6}>
                      <TextField type="password" label="Confirm Password" value={confirmPass} required fullWidth
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPass(e.target.value)}
                      />
                    </Grid>

                    <Collapse in={activateErr !== ""}>
                      <Alert severity="error" variant="filled">{activateErr}</Alert>
                    </Collapse>

                    <Grid container item xs={8} md={3}>
                      <Button variant="contained" color="primary" fullWidth type="submit">Register</Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Activate;