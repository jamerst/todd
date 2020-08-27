import React from 'react';
import { Switch, BrowserRouter } from "react-router-dom";
import Home from './components/Home';
import Login from './components/Login';
import AuthRoute from "./routes/AuthRoute";
import UnauthRoute from "./routes/UnauthRoute";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <AuthRoute exact path="/" component={Home} />
        <UnauthRoute exact path="/login" component={Login} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
