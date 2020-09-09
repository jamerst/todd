import React, { useState, useCallback } from "react"
import { Container, Grid, Typography, TextField, Button, Collapse } from "@material-ui/core";
import AuthUtils from "../utils/AuthUtils";
import { Alert } from "@material-ui/lab";

const Account = () => {
  const [oldPass, setOldPass] = useState<string>("");
  const [newPass, setNewPass] = useState<string>("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info" | "warning" | undefined>("success");
  const [alertMsg, setAlertMsg] = useState<string>("");

  const changePass = useCallback(async () => {
    const response = await AuthUtils.authFetch("/api/user/ChangePassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPass: oldPass,
        newPass: newPass
      })
    }, false);

    if (response.ok) {
      setAlertType("success");
      setAlertMsg("Password updated successfully")
    } else if (response.status === 401) {
      setAlertType("error");
      setAlertMsg(`Error: ${await response.text()}`);
    } else {
      setAlertType("error");
      setAlertMsg("There was an problem updating your password");
    }

    setOldPass("");
    setNewPass("");
  }, [oldPass, newPass]);

  return (
    <Container>
      <Typography variant="h3">Account Settings</Typography>

      <form onSubmit={(e) => { e.preventDefault(); changePass() }}>
        <Grid container direction="column" spacing={2}>
          <Grid item xs={12} md={6} lg={3}>
            <TextField type="password" required label="Current Password" fullWidth value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <TextField type="password" required label="New Password" fullWidth value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Collapse in={alertMsg !== ""}>
              <Alert severity={alertType} variant="filled">{alertMsg}</Alert>
            </Collapse>
          </Grid>

          <Grid item container xs={12} md={6} lg={3} justify="center">
            <Button variant="contained" type="submit" color="primary">Change Password</Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default Account;