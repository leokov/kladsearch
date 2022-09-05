import qs from 'qs';
import React, { Component } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import request from 'request';
import logo from './logo.svg';
import './App.css';

//const updateAfter = 700;
//const searchStateToUrl = (searchState) =>
//  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';

class App extends Component {
  constructor() {
    super();

    this.state = {
      searchState: qs.parse(window.location.search.slice(1)),
      results: {}
    };

    window.addEventListener('popstate', ({ state: searchState }) => {
      this.setState({ searchState });
    });
  }

  onSearchStateChange = (searchState) => {
    
    // update the URL when there is a new search state.
    //clearTimeout(this.debouncedSetState);
    //this.debouncedSetState = setTimeout(() => {
    //  window.history.pushState(
    //    searchState,
    //    null
        //searchStateToUrl(searchState)
    //  );
    //}, updateAfter);
  
      let url = `https://meridianbet.me/sails/search/page?query=${searchState.query}&locale=en`;
      request({url}, (error, response, body) => {
          // Do more stuff with 'body' here
          if (body) {
            const parsedBody = JSON.parse(body);
            if (parsedBody[0]) {
              console.log(typeof parsedBody[0].events);
              this.setState({ results: parsedBody[0].events });
              
            }
          }
      });
    

    this.setState((previousState) => {
      const hasQueryChanged =
        previousState.searchState.query !== searchState.query;

      return {
        ...previousState,
        searchState: {
          ...searchState,
          boundingBox: !hasQueryChanged ? searchState.boundingBox : null,
        }
      };
    });
  };
  render() {
    const { searchState, results } = this.state;
    console.log('searchState: ', searchState);
    console.log('results: ', results);
    let resultsHTML = [];
    if (Object.keys(results).length !== 0) {
      let i = 0;
      results.map(element => {
        i++;
        resultsHTML.push(<div key={i}><p>{JSON.stringify(element.name)}</p></div>);
      });
    }
    return (
      <div className="App">
        <header className="App-header">
        <InstantSearch
          searchClient={{}}
          //indexName="airbnb"
          searchState={searchState}
          onSearchStateChange={this.onSearchStateChange}
        >
          <SearchBox
            // Optional parameters
            //defaultRefinement={string}
            autoFocus
            searchAsYouType={false}
            //showLoadingIndicator
            //submit={React.Node}
            //reset={React.Node}
            //loadingIndicator={React.Node}
            //focusShortcuts={string[]}
            //onSubmit={() => {}}
            //onReset={() => {}}
            //on*={() => {}}
            //translations={object}
          />
        </InstantSearch>
        {resultsHTML}
        </header>
        
      </div>
    );
  }
}

export default App;
