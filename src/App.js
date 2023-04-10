import qs from 'qs';
import React, { Component } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import request from 'request';
import logo from './logo.svg';
import './App.css';

//const updateAfter = 700;
//const searchStateToUrl = (searchState) =>
//  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';
const hasDuplicates = (arr) => arr.length !== new Set(arr).size;

class App extends Component {
  constructor() {
    super();

    this.state = {
      searchState: qs.parse(window.location.search.slice(1)),
      resultsLobbet: {},
      resultsPremier: {},
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
              return new RegExp(searchState.query, 'i').test(matchString);
            });
            const resultLive = neededMatches.map((match) => {
              return {
                name: match.home + ' - ' + match.away// + ' ***live***'
              };
            });
            
            // search prematches
            url = `https://www.lobbet.me/ibet/search/matchesSearch/${searchState.query}.json`;
            
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
                  let resultsLobbet = resultLive.filter((m) => {
                    const hasMatch = resultPrematches.find((el) => {
                      return el.name == m.name;
                    });
                    return !hasMatch;
                  }).map((elem) => ({ name: elem.name + ' ***live***'})).concat(resultPrematches);
                  this.setState({ resultsLobbet });
                }
              };
            }); 
          }
        }
    });

    url = `https://premierbet.me/balance9876/user/logged`;

    const fetchOpts = {
      "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      "referrer": "https://premierbet.me/live",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "{}",
      "mode": "cors",
      "credentials": "include"
    };
    fetch(url, {...fetchOpts, "method": "POST"})
    .then(response => response.json())
    .then((response) => {
      if (!response.live_rev) return;
      const { live_rev, basic_rev } = response;
      
      //console.log(response);
      const liveCode = live_rev.published_revision;
      const preCode = basic_rev.published_revision;
      //console.log(' liveCode: ', liveCode);
      //console.log(' preCode: ', preCode);
      const aa = {...fetchOpts, "method": "GET"};
      //console.log('AA: ', aa)
      fetch(`https://premierbet.me/static/rev/ml-${liveCode}.json`, {
        "headers": {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          "cookie": "_gid=GA1.2.1529824822.1681137189; _xsrf=2|3f3f0c70|10c0a60564a715eb4829c6fddd2e94a9|1681137235; _gat_gtag_UA_45972012_6=1; _ga_4LW4XL35N3=GS1.1.1681165169.2.1.1681165927.0.0.0; _ga=GA1.1.915870690.1661884178",
          "Referer": "https://premierbet.me/live",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      })
      .then(response => response.json())
      .then((response) => {
        //console.log(response);
        if (!response.events) return;
        const matches = Object.values(response.events);
        const neededMatches = matches.filter((match) => {
          const matchString = match[6] + ' - ' + match[7];
          //console.log('live matchString: ', matchString);
          //console.log('match: ', match);
          return new RegExp(searchState.query, 'i').test(matchString);
        });
        //console.log('Needed matches: ', neededMatches);
        const resultLive = neededMatches.map((match) => {
          return {
            name: match[6] + ' - ' + match[7]
          };
        });
        //console.log('RESULT LIVE: ', resultLive);
        
        fetch(`https://premierbet.me/static/rev/ae-${preCode}.json`, {
          "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "_gid=GA1.2.1529824822.1681137189; _xsrf=2|3f3f0c70|10c0a60564a715eb4829c6fddd2e94a9|1681137235; _gat_gtag_UA_45972012_6=1; _ga_4LW4XL35N3=GS1.1.1681165169.2.1.1681165927.0.0.0; _ga=GA1.1.915870690.1661884178",
            "Referer": "https://premierbet.me/live",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": null,
          "method": "GET"
        })
        .then(response => response.json())
        .then((response) => {
          //console.log('RESONSE: ', response);
          if (!response.events) return;
          const matches = Object.values(response.events);
          const neededMatches = matches.filter((match) => {
            const matchString = match[6] + ' - ' + match[7];
            //console.log('pre matchString: ', matchString);
            //console.log('match: ', match);
            const matchDate = new Date(match[5]);
            //console.log('matchDate: ', matchDate);
            if (matchDate <= Date.now()) return false;
            return new RegExp(searchState.query, 'i').test(matchString);
          });
          const resultPrematches = neededMatches.map((match) => {
            return {
              name: match[6] + ' - ' + match[7]
            };
          });
          let resultsPremier = resultLive.map((elem) => ({ name: elem.name + ' ***live***'})).concat(resultPrematches);
          this.setState({ resultsPremier });
        }).catch((e) => console.error);
          //console.log('Needed matches: ', neededMatches);
          

        
        /** 
        for (const property in response.events) {
          //console.log(`${property}: ${response.events[property]}`);
          const neededMatches = matches.filter((match) => {
            const matchString = match.home + ' - ' + match.away;
            return new RegExp(searchState.query, 'i').test(matchString);
          });
          const matchName = response.events[property][6] + ' - ' + response.events[property][7];
          console.log('matchName: ', matchName);
        }*/
      }).catch((e) => console.error);

    }).catch((e) => console.error);

   // const response = await fetch("http://example.com/movies.json");
  //const jsonData = await response.json();
  //console.log(jsonData);
    /** 
    request({url, method: 'POST'}, (error, response, body) => {
      // Do more stuff with 'body' here
      console.log('ERROR: ', error);
      console.log('response: ', response);
      if (!body) return;
      console.log('BODY: ', body);
      const parsedBody = JSON.parse(body);
      console.log('Premier Parsed response body: ', parsedBody);
      if (!parsedBody.live_rev) return;
      const { live_rev, basic_rev } = parsedBody;
      console.log(' live_rev: ', live_rev);
      console.log(' basic_rev: ', basic_rev);
    });
    */
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
    const { searchState, resultsLobbet, resultsPremier, resultsMeridian, resultsVolcano, resultsMaxbet } = this.state;
    //console.log('searchState: ', searchState);
    //console.log('resultsLobbet: ', resultsLobbet);
    //console.log('resultsMeridian: ', resultsMeridian);
    //console.log('resultsVolcano: ', resultsVolcano);
    //console.log('resultsMaxbet: ', resultsMaxbet);
    let resultsLobbetHTML = [];
    let resultsPremierHTML = [];
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
    if (Object.keys(resultsPremier).length !== 0) {
      resultsPremier.map(element => {
        i++;
        resultsPremierHTML.push(<div key={i}><p>{element.name.toString()}</p></div>);
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
              <p>Premier</p>
              {resultsPremierHTML}
            </div>
            <div style={boxStyle}>
              <p>Volcano</p>
              {resultsVolcanoHTML}
            </div>
            <div style={boxStyle}>
              <p>Meridian</p>
              {resultsMeridianHTML}
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
