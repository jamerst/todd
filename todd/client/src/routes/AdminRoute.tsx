import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import AuthUtils from '../utils/AuthUtils';

const AdminRoute = (props: RouteProps) => {
  if (!AuthUtils.isAdmin()) {
    return <Redirect to="/" />;
  }

  return <Route {...props} />;
};

export default AdminRoute;
