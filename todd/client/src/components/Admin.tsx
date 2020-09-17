import React, { useCallback, useEffect, useState } from "react"
import { Box, Button, Checkbox, Collapse, Container, FormControlLabel, Grid, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { FileCopy } from "@material-ui/icons";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import CopyToClipboard from "react-copy-to-clipboard";

import AuthUtils from "../utils/AuthUtils";
import { red } from "@material-ui/core/colors";
import ConfirmationDialog from "./ConfirmationDialog";

const useStyles = makeStyles((theme: Theme) => createStyles({
  link: {
    color: "inherit"
  },
  danger: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
    "&:hover": {
      backgroundColor: red[700]
    }
  }
}));

type User = {
  id: string,
  username: string,
  active: boolean,
  admin: boolean,
  passwordReset: string
}

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

  const [users, setUsers] = useState<User[]>([]);
  const [userMsg, setUserMsg] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string>("");

  const fetchPassword = useCallback(async () => {
    const response = await AuthUtils.authFetch("/api/admin/GetSitePassword");

    if (response.ok) {
      setPassword(await response.json());
    }
  }, []);

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
      fetchUsers();
    } else {
      setCreateUserErr(true);
      setCreateUserMsg(`Failed to create user: ${await response.text()}`)
    }
  }, [username, admin]);

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

  const fetchUsers = useCallback(async () => {
    const response = await AuthUtils.authFetch("/api/admin/GetUsers");

    if (response.ok) {
      setUsers(await response.json());
    }
  }, []);

  const changeAdmin = useCallback(async (id: string, admin: boolean) => {
    const response = await AuthUtils.authFetch(`/api/admin/SetAdmin/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin)
    });

    if (response.ok) {
      setUserMsg("Successfully updated admin status");
    } else {
      setUserMsg("Error updating admin status");

      let newUsers = [...users];
      let modified = newUsers.findIndex(u => u.id === id);
      newUsers[modified].admin = !admin;
      setUsers(newUsers);
    }
  }, [users])

  const resetPassword = useCallback(async (id: string) => {
    const response = await AuthUtils.authFetch(`/api/admin/ResetPassword/${id}`, {
      method: "POST"
    });

    if (response.ok) {
      let newUsers = [...users];
      let modified = newUsers.findIndex(u => u.id === id);
      newUsers[modified].passwordReset = await response.json();
      newUsers[modified].active = false;
      setUsers(newUsers);
      setUserMsg("Successfully created password reset");
    } else {
      setUserMsg("Error resetting user password");
    }
  }, [users]);

  const deleteUser = useCallback(async () => {
    const response = await AuthUtils.authFetch(`/api/admin/DeleteUser/${deleteId}`, {
      method: "POST"
    });

    if (response.ok) {
      setUserMsg("Successfully deleted user");
      fetchUsers();
    } else {
      setUserMsg("Error deleting user");
    }
  }, [deleteId])

  useEffect(() => {
    fetchPassword();
    fetchUsers();
  }, [fetchPassword, fetchUsers]);

  return (
    <Container>
      <Typography variant="h3">Admin Settings</Typography>
      <Paper>
        <Box mt={2} p={2}>
          <Grid container direction="column" justify="flex-start" spacing={3}>
            <Grid item container justify="flex-start" spacing={1}>
              <Typography variant="h5">Add a New User</Typography>
              <Grid item container alignItems="center" spacing={2}>
                <Grid item xs={12} md={4} lg={3}>
                  <TextField label="Username" value={username} fullWidth required
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2} lg={1}>
                  <FormControlLabel
                    control={<Checkbox color="default" checked={admin} onChange={(e) => setAdmin(e.target.checked)} />}
                    label="Admin"
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
                  <TextField label="Password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required />
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

      <Paper>
        <Box mt={2} p={2}>
          <Typography variant="h4">Users</Typography>
          <Table>
            <TableHead>
              <TableCell>Username</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Actions</TableCell>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={`user-${user.id}`}>
                  <TableCell component="th" scope="row">{user.username}</TableCell>
                  <TableCell><Checkbox checked={user.active} color="primary" /></TableCell>
                  <TableCell>
                    <Checkbox
                      checked={user.admin}
                      color="primary"
                      onChange={(e) => {
                        let newUsers = [...users];
                        let modified = newUsers.findIndex(u => u.id === user.id);
                        newUsers[modified].admin = e.target.checked;

                        setUsers(newUsers);

                        changeAdmin(user.id, e.target.checked);
                      }} />
                  </TableCell>
                  <TableCell>
                    <Grid container direction="column" spacing={2}>
                      <Grid item container spacing={1}>
                        <Grid item>
                          <Button variant="contained" color="secondary" onClick={() => resetPassword(user.id)}>Reset Password</Button>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" className={classes.danger} onClick={() => setDeleteId(user.id)}>Delete User</Button>
                        </Grid>
                      </Grid>

                      {user.passwordReset ?
                        <Grid item>
                          <strong>
                            Reset Link: <a href={`/reset/${user.passwordReset}`} className={classes.link}>
                              {window.location.origin}/reset/{user.passwordReset}
                            </a>
                          </strong>
                        </Grid> : null
                      }
                    </Grid>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Snackbar open={userMsg !== ""} autoHideDuration={5000} onClose={() => setUserMsg("")} message={userMsg} />
      <ConfirmationDialog
        open={deleteId !== ""}
        onConfirm={() => { deleteUser(); setDeleteId("") }}
        onReject={() => setDeleteId("")}
        title="Delete User?"
        description="Are you sure you want to delete this user? This action cannot be undone."
        primaryLabel="Delete"
      />
    </Container>
  );
}

export default Admin;