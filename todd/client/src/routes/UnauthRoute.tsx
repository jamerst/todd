import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import AuthUtils from '../utils/AuthUtils';

const RouteUnauthenticated = (props: RouteProps) => {
  if (AuthUtils.isLoggedIn()) {
    return <Redirect to="/" />;
  }

  return <Route {...props} />;
};

export default RouteUnauthenticated;
