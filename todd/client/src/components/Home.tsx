import React, { Component } from 'react';
import NavBar from './NavBar';
import { RouteComponentProps } from 'react-router-dom';
import AuthUtils from '../utils/Auth';

type HomeState = {
  loggedIn: boolean,
  canWrite: boolean,
  admin: boolean
}

export default class Home extends Component<RouteComponentProps, HomeState> {
    state = {
      loggedIn: false,
      canWrite: false,
      admin: false
    };

  componentDidMount() {
    this.setState({
      loggedIn: AuthUtils.isLoggedIn()
    }, () => {
      if (!this.state.loggedIn) {
        this.props.history.push("/login")
      } else {
        this.setState({
          canWrite: AuthUtils.canWrite(),
          admin: AuthUtils.isAdmin()
        });
      }
    })
  }

  render() {
    return (
      <NavBar
        loggedIn={this.state.loggedIn}
        canWrite={this.state.canWrite}
        admin={this.state.admin}
      />
    );
  }
}
