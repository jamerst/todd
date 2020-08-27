import React, { Component } from 'react';
import NavBar from './NavBar';
import { RouteComponentProps } from 'react-router-dom';
import AuthUtils from '../utils/Auth';

type HomeState = {
  canWrite: boolean,
  admin: boolean
}

export default class Home extends Component<RouteComponentProps, HomeState> {
  state = {
    canWrite: false,
    admin: false
  };

  componentDidMount() {
    if (AuthUtils.isLoggedIn()) {
      this.setState({
        canWrite: AuthUtils.canWrite(),
        admin: AuthUtils.isAdmin()
      })
    }
  }

  render() {
    return (
      <NavBar
        canWrite={this.state.canWrite}
        admin={this.state.admin}
      />
    );
  }
}
