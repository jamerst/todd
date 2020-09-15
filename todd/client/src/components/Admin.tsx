import React, { Fragment, useCallback, useEffect, useState } from "react"
import { Box, Button, Checkbox, Collapse, Container, createStyles, FormControlLabel, Grid, IconButton, InputAdornment, makeStyles, Paper, TextField, Tooltip, Typography } from "@material-ui/core";
import AuthUtils from "../utils/AuthUtils";
import { Alert } from "@material-ui/lab";
import { FileCopy } from "@material-ui/icons";
import CopyToClipboard from "react-copy-to-clipboard";

const useStyles = makeStyles(() => createStyles({
  link: {
    color: "inherit"
  }
}));

const Admin = () => {
  const classes = useStyles();

  const [password, setPassword] = useState<string>("Loading..");
  const [passwordMsg, setPasswordMsg] = useState<string>("");
  const [passwordErr, setPasswordErr] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");
  const [admin, setAdmin] = useState<boolean>(false);
  const [createUserMsg, setCreateUserMsg] = useState<string>("")
  const [createUserErr, setCreateUserErr] = useState<boolean>(false);
  const [activationId, setActivationId] = useState<string>("");


  const fetchPassword = useCallback(async () => {
    const response = await AuthUtils.authFetch("/api/admin/GetSitePassword");

    if (response.ok) {
      setPassword(await response.json());
    }
  }, []);

  const changePassword = useCallback(async () => {
    setPasswordMsg("");
    const response = await AuthUtils.authFetch("/api/admin/SetSitePassword", {
      method: "POST",
      body: JSON.stringify(password),
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      setPasswordErr(false);
      setPasswordMsg("Successfully change site password");
    } else {
      setPasswordErr(true);
      setPasswordMsg("Failed to change site password");
      fetchPassword();
    }
  }, [password, fetchPassword]);

  const createUser = useCallback(async () => {
    setCreateUserMsg("");

    const response = await AuthUtils.authFetch("/api/admin/CreateUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        admin: admin
      })
    });

    if (response.ok) {
      setCreateUserErr(false);
      setCreateUserMsg("Successfully created user account");
      setUsername("");
      setAdmin(false);
      setActivationId(await response.json());
    } else {
      setCreateUserErr(true);
      setCreateUserMsg(`Failed to create user: ${await response.text()}`)
    }
  }, [username, admin]);

  useEffect(() => {
    fetchPassword();
  }, [fetchPassword]);

  return (
    <Container>
      <Typography variant="h3">Admin Settings</Typography>
      <Paper>
        <Box mt={2} p={2}>
          <Grid container direction="column" justify="flex-start" spacing={3}>
            <Grid item container justify="flex-start" spacing={1}>
              <Typography variant="h5">Add a New User</Typography>
              <Grid item container alignItems="center" spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField variant="filled" label="Username" value={username} fullWidth required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <FormControlLabel
                            control={
                              <Checkbox color="default" value={admin} onChange={(e) => setAdmin(e.target.checked)} />
                            }
                            label="Admin"
                          />
                        </InputAdornment>
                      )
                    }}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" onClick={() => createUser()}>Create New User</Button>
                </Grid>
              </Grid>
              <Grid item>
                <Collapse in={createUserMsg !== ""}>
                  <Alert severity={createUserErr ? "error" : "success"} variant="filled">
                    {createUserMsg}
                    {createUserErr ? null :
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography variant="body1">
                            <strong>
                              Account Activation Link: <a href={`/activate/${activationId}`} className={classes.link}>
                                {window.location.origin}/activate/{activationId}
                              </a>
                            </strong>
                          </Typography>
                        </Grid>

                        <Grid item>
                          <CopyToClipboard text={`${window.location.origin}/activate/${activationId}`}>
                            <Tooltip title="Copy activation link to clipboard">
                              <IconButton color="inherit">
                                <FileCopy color="inherit" />
                              </IconButton>
                            </Tooltip>
                          </CopyToClipboard>
                        </Grid>
                      </Grid>
                    }
                  </Alert>
                </Collapse>
              </Grid>
            </Grid>

            <Grid item container justify="flex-start" spacing={1}>
              <Typography variant="h5">Change Site Password</Typography>
              <Grid item container alignItems="center" spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField variant="filled" label="Password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" onClick={changePassword}>Change Password</Button>
                </Grid>
              </Grid>
              <Grid item>
                <Collapse in={passwordMsg !== ""}>
                  <Alert severity={passwordErr ? "error" : "success"} variant="filled">{passwordMsg}</Alert>
                </Collapse>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Admin;