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
      resultsMeridian: {},
      resultsVolcano: {},
      resultsMaxbet: {}
    };

    window.addEventListener('popstate', ({ state: searchState }) => {
      this.setState({ searchState });
    });
  }

  onSearchStateChange = (searchState) => {
     
    let url = `https://meridianbet.me/sails/search/page?query=${searchState.query}&locale=en`;
    request({url}, (error, response, body) => {
        // Do more stuff with 'body' here
        if (body) {
          const parsedBody = JSON.parse(body);
          if (parsedBody[0]) {
            this.setState({ resultsMeridian: parsedBody[0].events });
            
          }
        }
    });

    url = `https://sportdataprovider.volcanobet.me/api/public/prematch/search?searchString=${searchState.query}`;
    request({url}, (error, response, body) => {
        // Do more stuff with 'body' here
        if (body) {
          const parsedBody = JSON.parse(body);
          //console.log('Volcano parsedBody: ', parsedBody);
          if (parsedBody[0]) {
            //console.log('Volcano parsedBody[0]: ', parsedBody[0]);
            //console.log(typeof parsedBody[0].events);
            this.setState({ resultsVolcano: parsedBody });
            
          }
        }
    });

    url = `https://api.allorigins.win/get?url=https://api.maxbet.me/search?query=${searchState.query}`;
    
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.contents) {
        const parsedBody = JSON.parse(data.contents);
        this.setState({ resultsMaxbet: parsedBody.events });
      }
      //console.log('data.contents: ', JSON.parse(data.contents).events);
    })
    .catch((error) => console.log('ERROR: ', error));
    

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
    const boxStyle = {
      'border-style': 'solid',
      margin: '5px',
      padding: '10px'
    };
    const { searchState, resultsMeridian, resultsVolcano, resultsMaxbet } = this.state;
    console.log('searchState: ', searchState);
    console.log('resultsMeridian: ', resultsMeridian);
    console.log('resultsVolcano: ', resultsVolcano);
    console.log('resultsMaxbet: ', resultsMaxbet);
    let resultsMeridianHTML = [];
    let resultsVolcanoHTML = [];
    let resultsMaxbetHTML = [];
    let i = 0;
    if (Object.keys(resultsMeridian).length !== 0) {
      resultsMeridian.map(element => {
        i++;
        resultsMeridianHTML.push(<div key={i}><p>{JSON.stringify(element.name)}</p></div>);
      });
    }
    if (Object.keys(resultsVolcano).length !== 0) {
      resultsVolcano.map(element => {
        i++;
        resultsVolcanoHTML.push(<p key={i}>{element.participants.map((p) => p.name).join(' - ')} {element.l ? '<----- LIVE':''}</p>);
      });
    }
    if (Object.keys(resultsMaxbet).length !== 0) {
      resultsMaxbet.map(element => {
        i++;
        resultsMaxbetHTML.push(<p key={i}>{element.competitors.map((p) => p.name).join(' - ')} {element.live ? '<----- LIVE':''}</p>);
      });
    }
    return (
      <div className="App">
        <header>
        <div style={boxStyle}>
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
        </div>
        
        </header>
            <div style={boxStyle}>
              <p>Meridian</p>
              {resultsMeridianHTML}
            </div>
            <div style={boxStyle}>
              <p>Volcano</p>
              {resultsVolcanoHTML}
            </div>
            <div style={boxStyle}>
              <p>Maxbet</p>
              {resultsMaxbetHTML}
            </div>
      </div>
    );
  }
}

export default App;
