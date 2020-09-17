import React, { useCallback, useEffect, useState } from "react"
import { Box, Button, Container, Collapse, Grid, Card, CardContent, TextField, Typography, CircularProgress } from "@material-ui/core";
import { Alert } from "@material-ui/lab"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import logo from "../logo.svg";
import { useHistory, useParams } from "react-router";
import AuthUtils from "../utils/AuthUtils";
import { Link } from "react-router-dom";
import { Error } from "@material-ui/icons";
import { red } from "@material-ui/core/colors";

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

const ResetPassword = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();

  const [resetValidMsg, setResetValidMsg] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const [resetErr, setResetErr] = useState<string>("");

  const resetStatus = useCallback(async () => {
    const response = await fetch(`/api/user/GetResetStatus/${id}`);

    if (response.ok) {
      setResetValidMsg("good");
    } else if (response.status === 404) {
      setResetValidMsg("Not Found");
    } else if (response.status === 403) {
      setResetValidMsg("Expired");
    }
  }, [id]);

  const resetPassword = useCallback(async () => {
    setResetErr("");

    if (password !== confirmPass) {
      setResetErr("Passwords don't match");
      return;
    }

    const response = await AuthUtils.authFetch("/api/user/ResetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resetId: id,
        password: password
      })
    });

    if (response.ok) {
      AuthUtils.destroyTokens();
      history.push("/login");
    } else {
      setResetErr("An error occurred when trying to change your password");
    }
  }, [id, password, confirmPass])

  useEffect(() => {
    resetStatus();
  }, []);

  if (resetValidMsg === ""){
    return (
      <Grid container justify="center" alignItems="center" className={classes.grid}>
        <CircularProgress />
      </Grid>
    )
  } else if (resetValidMsg !== "good") {
    return (
      <Grid container direction="column" justify="center" alignItems="center" className={classes.grid}>
        <Error style={{color: red[700], fontSize: 200}}/>
        <Typography variant="h3">Password Reset {resetValidMsg}</Typography>
        <Typography variant="h5"><Link to="/login">Return to Login</Link></Typography>
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
                  <Typography variant="h4">Reset Password</Typography>
                  <Typography variant="body1">Please choose a new password.</Typography>
                </Box>
                <form onSubmit={(e) => {e.preventDefault(); resetPassword()}}>
                  <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
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

                    <Collapse in={resetErr !== ""}>
                      <Alert severity="error" variant="filled">{resetErr}</Alert>
                    </Collapse>

                    <Grid container item xs={8} md={3}>
                      <Button variant="contained" color="primary" fullWidth type="submit">Reset</Button>
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

export default ResetPassword;