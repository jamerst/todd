import React, { useState } from "react";
import { Switch, BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { teal, orange } from "@material-ui/core/colors";

import Home from "./components/Home";
import Item from "./components/Item";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout"

import AuthRoute from "./routes/AuthRoute";
import UnauthRoute from "./routes/UnauthRoute";
import "./App.css";
import Account from "./components/Account";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem("theme") === "dark"
    || (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem("theme") === null)
  );

  const theme = React.useMemo(() =>
    createMuiTheme({
      palette: {
        type: darkMode ? "dark" : "light",
        primary: {
          main: darkMode ? teal[600] : teal[800]
        },
        secondary: {
          main: orange[800]
        }
      },
    }),
    [darkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Switch>
          <AuthRoute exact path="/">
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Home />
            </MainLayout>
          </AuthRoute>

          <AuthRoute exact path="/item/:id">
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Item />
            </MainLayout>
          </AuthRoute>

          <AuthRoute exact path="/account">
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Account />
            </MainLayout>
          </AuthRoute>

          <UnauthRoute exact path="/login" component={Login} />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
