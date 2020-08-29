import React from 'react';
import { Switch, BrowserRouter } from "react-router-dom";
import { useMediaQuery, CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { teal } from "@material-ui/core/colors";
import Home from './components/Home';
import Login from './components/Login';
import AuthRoute from "./routes/AuthRoute";
import UnauthRoute from "./routes/UnauthRoute";

function App() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(() =>
    createMuiTheme({
      palette: {
        type: prefersDark ? 'dark' : 'light',
        primary: {
          main: teal[800]
        }
      },
    }),
    [prefersDark],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <BrowserRouter>
        <Switch>
          <AuthRoute exact path="/" component={Home} />
          <UnauthRoute exact path="/login" component={Login} />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
