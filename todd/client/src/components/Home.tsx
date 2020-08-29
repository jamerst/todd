import React, { Component, Fragment } from 'react';
import { Container, Box, Grid } from "@material-ui/core";
import NavBar from './NavBar';
import ItemResult, { ItemResultData } from "./ItemResult";
import { RouteComponentProps } from 'react-router-dom';
import AuthUtils from '../utils/Auth';

type HomeState = {
  canWrite: boolean,
  admin: boolean,
  params: SearchParams,
  results: ItemResultData[],
  numResults: number
}

type SearchParams = {
  name: string,
  type: number,
  locationId: string,
  pageNum: number,
  pageSize: number
}

export default class Home extends Component<RouteComponentProps, HomeState> {
  state = {
    canWrite: false,
    admin: false,
    params: {
      name: "",
      type: -1,
      locationId: "",
      pageNum: 1,
      pageSize: 25
    },
    results: [],
    numResults: 0
  };

  componentDidMount() {
    if (AuthUtils.isLoggedIn()) {
      this.setState({
        canWrite: AuthUtils.canWrite(),
        admin: AuthUtils.isAdmin()
      });

      this.fetchSearchResults();
    }
  }

  fetchSearchResults = async () => {
    const response = await AuthUtils.authFetch("/api/item/SearchItems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.state.params)
    });

    if (response.ok) {
      const data = await response.json();
      this.setState({
        results: data.results,
        numResults: data.count
      });
    }
  }

  render() {
    return (
      <Fragment>
        <NavBar
          canWrite={this.state.canWrite}
          admin={this.state.admin}
        />
        <Box mt={2}>
          <Container>
            <Grid container spacing={2}>
              {this.state.results.map((i: ItemResultData) => (
                <ItemResult item={i} key={`result-${i.id}`}/>
              ))}
            </Grid>
          </Container>
        </Box>
      </Fragment>
    );
  }
}
