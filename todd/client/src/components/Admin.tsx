import React, { useCallback, useEffect, useState } from "react"
import { Box, Button, Checkbox, Collapse, Container, FormControlLabel, Grid, InputAdornment, Paper, TextField, Typography } from "@material-ui/core";
import AuthUtils from "../utils/AuthUtils";
import { Alert } from "@material-ui/lab";

const Admin = () => {
  const [password, setPassword] = useState<string>("");
  const [passwordMsg, setPasswordMsg] = useState<string>("");
  const [passwordErr, setPasswordErr] = useState<boolean>(false);

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
  }, [password])

  useEffect(() => {
    fetchPassword();
  }, [])

  return (
    <Container>
      <Typography variant="h3">Admin Settings</Typography>
      <Paper>
        <Box mt={2} p={2}>
          <Grid container direction="column" justify="flex-start" spacing={3}>
            <Grid item>
              <Typography variant="h5">Add a New User</Typography>
              <Grid item container alignItems="center" spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField variant="filled" label="Username" fullWidth required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <FormControlLabel
                            control={
                              <Checkbox color="default" />
                            }
                            label="Admin"
                          />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary">Create New User</Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item container justify="flex-start" spacing={1}>
              <Typography variant="h5">Change Site Password</Typography>
              <Grid item container alignItems="center" spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField variant="filled" label="Password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required/>
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