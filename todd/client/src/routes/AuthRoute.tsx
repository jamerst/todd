import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import AuthUtils from '../utils/AuthUtils';

const AuthRoute = (props: RouteProps) => {
  if (!AuthUtils.isLoggedIn()) {
    return <Redirect to={`/login?returnUrl=${props.location ? props.location.pathname : ""}${props.location ? props.location.search : ""}`} />;
  }

  return <Route {...props} />;
};

export default AuthRoute;
