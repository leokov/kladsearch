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
      resultsLobbet: {},
      resultsMeridian: {},
      resultsVolcano: {},
      resultsMaxbet: {}
    };

    window.addEventListener('popstate', ({ state: searchState }) => {
      this.setState({ searchState });
    });
  }

  onSearchStateChange = (searchState) => {

    //let url = `https://www.lobbet.me/ibet/async/live/multy/-1.json`;
    let url = `https://www.lobbet.me/ibet/async/live/multy/1.json`;
    request({url, method: 'POST'}, (error, response, body) => {
        // Do more stuff with 'body' here
        if (body) {
          
          const parsedBody = JSON.parse(body);
          //console.log('LOBBBB1: ', parsedBody);
          if (parsedBody.IMatchLiveContainer) {
            const matches = parsedBody.IMatchLiveContainer.matches;
            const neededMatches = matches.filter((match) => {
              
              const matchString = match.home + ' - ' + match.away;
              //console.log('matchString: ', matchString);
              return new RegExp(searchState.query, 'i').test(matchString);
              //return matchString.match(`/${searchState.query}/i`);
              //return matchString.includes(searchState.query);
            });
            const resultLive = neededMatches.map((match) => {
              return {
                name: match.home + ' - ' + match.away + ' ***live***'
              };
            });
            this.setState({ resultsLobbet: resultLive });
            // search prematches
            url = `https://www.lobbet.me/ibet/search/matchesSearch/${searchState.query}.json`;
            //console.log('PREMATCHES URL: ', url);
            request({url, method: 'GET'}, (error, response, body) => {
              // Do more stuff with 'body' here
              if (body) {
                const parsedBody = JSON.parse(body);
                if (parsedBody.matches) {
                  const resultPrematches = parsedBody.matches.map((match) => {
                    return {
                      name: match.home + ' - ' + match.away
                    };
                  });
                  this.setState({ resultsLobbet: resultLive.concat(resultPrematches) });
                }
                //console.log('PREMATCHES: ', parsedBody);
              };
            });

            //console.log('filteredMatches : ', result);
            
          }
          
          //const parsedBody = JSON.stringify(body, null, 2);
          //console.log('LOBBBBB parsedBody: ', parsedBody);
          //if (parsedBody.IMatchLiveContainer) {
          //  this.setState({ resultsLobbet: parsedBody.IMatchLiveContainer.matches });  
          //}
        }
    });
    
    url = `https://meridianbet.me/sails/search/page?query=${searchState.query}&locale=en`;
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
        },
        searching: !hasQueryChanged
      };
    });
  };
  render() {
    const boxStyle = {
      'border-style': 'solid',
      margin: '5px',
      padding: '10px'
    };
    const { searchState, resultsLobbet, resultsMeridian, resultsVolcano, resultsMaxbet } = this.state;
    //console.log('searchState: ', searchState);
    //console.log('resultsLobbet: ', resultsLobbet);
    //console.log('resultsMeridian: ', resultsMeridian);
    //console.log('resultsVolcano: ', resultsVolcano);
    //console.log('resultsMaxbet: ', resultsMaxbet);
    let resultsLobbetHTML = [];
    let resultsMeridianHTML = [];
    let resultsVolcanoHTML = [];
    let resultsMaxbetHTML = [];
    let i = 0;
    if (Object.keys(resultsLobbet).length !== 0) {
      resultsLobbet.map(element => {
        i++;
        resultsLobbetHTML.push(<div key={i}><p>{element.name.toString()}</p></div>);
      });
    }
    if (Object.keys(resultsMeridian).length !== 0) {
      resultsMeridian.map(element => {
        i++;
        resultsMeridianHTML.push(<div key={i}><p>{element.name.toString()}</p></div>);
      });
    }
    if (Object.keys(resultsVolcano).length !== 0) {
      resultsVolcano.map(element => {
        i++;
        resultsVolcanoHTML.push(<p key={i}>{element.participants.map((p) => p.name).join(' - ')} {element.l ? '***live***':''}</p>);
      });
    }
    if (Object.keys(resultsMaxbet).length !== 0) {
      resultsMaxbet.map(element => {
        i++;
        resultsMaxbetHTML.push(<p key={i}>{element.competitors.map((p) => p.name).join(' - ')} {element.live ? '***live***':''}</p>);
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
              <p>Lobbet</p>
              {resultsLobbetHTML}
            </div>
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
