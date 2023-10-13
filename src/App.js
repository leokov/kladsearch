import qs from 'qs';
import React, { Component } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import request from 'request';
import logo from './logo.svg';
import './App.css';
//import base64 from 'base-64';
//const goog = require('goog');
//import 'instantsearch.css/themes/satellite.css';

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info
*
**/
const liveInd = ' --- LIVE ---';

let url = '';

var Base64 = {

  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

  // public method for encoding
  , encode: function (input)
  {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      input = Base64._utf8_encode(input);

      while (i < input.length)
      {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2))
          {
              enc3 = enc4 = 64;
          }
          else if (isNaN(chr3))
          {
              enc4 = 64;
          }

          output = output +
              this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
              this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      } // Whend 

      return output;
  } // End Function encode 


  // public method for decoding
  ,decode: function (input)
  {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length)
      {
          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 != 64)
          {
              output = output + String.fromCharCode(chr2);
          }

          if (enc4 != 64)
          {
              output = output + String.fromCharCode(chr3);
          }

      } // Whend 

      output = Base64._utf8_decode(output);

      return output;
  } // End Function decode 


  // private method for UTF-8 encoding
  ,_utf8_encode: function (string)
  {
      var utftext = "";
      string = string.replace(/\r\n/g, "\n");

      for (var n = 0; n < string.length; n++)
      {
          var c = string.charCodeAt(n);

          if (c < 128)
          {
              utftext += String.fromCharCode(c);
          }
          else if ((c > 127) && (c < 2048))
          {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
          }
          else
          {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
          }

      } // Next n 

      return utftext;
  } // End Function _utf8_encode 

  // private method for UTF-8 decoding
  ,_utf8_decode: function (utftext)
  {
      var string = "";
      var i = 0;
      var c, c1, c2, c3;
      c = c1 = c2 = 0;

      while (i < utftext.length)
      {
          c = utftext.charCodeAt(i);

          if (c < 128)
          {
              string += String.fromCharCode(c);
              i++;
          }
          else if ((c > 191) && (c < 224))
          {
              c2 = utftext.charCodeAt(i + 1);
              string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
              i += 2;
          }
          else
          {
              c2 = utftext.charCodeAt(i + 1);
              c3 = utftext.charCodeAt(i + 2);
              string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
              i += 3;
          }

      } // Whend 

      return string;
  } // End Function _utf8_decode 

}

class App extends Component {
  constructor() {
    super();

    this.state = {
      searchState: qs.parse(window.location.search.slice(1)),
      resultsLobbet: {},
      resultsPremier: {},
      resultsSbbet: {},
      resultsMeridian: {},
      resultsVolcano: {},
      resultsMaxbet: {},
      resultsAdmiral: {},
      resultsZlatnik: {},
    };

    window.addEventListener('popstate', ({ state: searchState }) => {
      this.setState({ searchState });
    });
  }

  onSearchStateChange = (searchState) => {
    const compareMatch = (input) => new RegExp(searchState.query, 'i').test(input);

    // -----
    // LOBBET
    // -----
    url = `https://www.lobbet.me/ibet/async/live/multy/1.json`;
     request({url, method: 'POST'}, (error, response, body) => {
        if (body) {
          const parsedBody = JSON.parse(body);
          //console.log('LOBBBB1: ', parsedBody);
          if (parsedBody.IMatchLiveContainer) {
            const matches = parsedBody.IMatchLiveContainer.matches;
            const neededMatches = matches.filter((match) => {
              const matchString = match.home + ' - ' + match.away;
              return new RegExp(searchState.query, 'i').test(matchString) && match.showInLive;
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
                  }).map((elem) => ({ name: elem.name + ' --- LIVE ---'})).concat(resultPrematches);
                  this.setState({ resultsLobbet });
                }
              };
            }); 
          }
        }
    });

    // -----
    // ZLATNIK
    // -----
    
    // Search prematches
    fetch(`https://apis.zlatnik.me/SportsOfferApi/api/sport/offer/v3/search?Value=${searchState.query}&Offset=0&Limit=1000`, {
      "headers": {},
      "body": null,
      "method": "GET"
    })
    .then(res => res.json())
    .then(resJson => {

      const getMatchesFromRes = (res) => {
        if (!res) return [];
        const matches = [];
        res.forEach(sportType => {
          sportType.Categories.forEach(category => {
            category.Leagues.forEach(league => {
              league.Matches.forEach(match => {
                matches.push(match.TeamHome + ' - ' + match.TeamAway);
              });
            });
          });
        });
        return matches;
      };

      // get result prematches names
      const neededPreMatches = getMatchesFromRes(resJson.Response);

      // Fetch all live matches
      fetch('https://apis.zlatnik.me/SportsOfferApi/api/sport/offer/v3/matches/live', {
        "body": null,
        "method": "GET"
      })
      .then(res => res.json())
      .then(resJson => {
        const liveMatches = getMatchesFromRes(resJson);
        // Search for needed matches
        const neededLiveMatches = liveMatches.filter(m => compareMatch(m));
        this.setState({
          resultsZlatnik: neededLiveMatches.map(m => m + liveInd).concat(neededPreMatches)
        });
      })
      .catch(e => console.error);
    })
    .catch(e => console.error);

    // -----
    // ADMIRAL
    // -----

    fetch(`https://quiet-sky-9919.lenkovlen9913.workers.dev/?https://webapi.admiralbet.me/SportBookCacheWeb/api/offer/SearchEventsWeb/${searchState.query}/false`, {
      "headers": {
        //"accept": "application/json, text/plain, */*",
        //"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        //"content-type": "application/json",
        //"language": "sr-Latn",
        "officeid": "1175",
        //"sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
        //"sec-ch-ua-mobile": "?0",
        //"sec-ch-ua-platform": "\"macOS\"",
        //"sec-fetch-dest": "empty",
        //"sec-fetch-mode": "cors",
        //"sec-fetch-site": "same-site",
        //"Referer": "https://website.admiralbet.me/",
        //"Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    })
    .then(response => {
      //console.log('ADMIRAL : ', response);
      return response.json();
    })
    .then((response) => {
      const neededPreMatches = response.map((m) => m.name);
      // Fetch live matches, Admiral API has the search only for prematches
      
      // Fetch live matches
      fetch("https://quiet-sky-9919.lenkovlen9913.workers.dev/?https://webapi.admiralbet.me/SportBookCacheWeb/api/offer/livetree/4/null/true/true/false", {
        "headers": {
          //"accept": "application/json, text/plain, */*",
          //"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          //"content-type": "application/json",
          //"language": "sr-Latn",
          "officeid": "1175",
          //"sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
          //"sec-ch-ua-mobile": "?0",
          //"sec-ch-ua-platform": "\"macOS\"",
          //"sec-fetch-dest": "empty",
          //"sec-fetch-mode": "cors",
          //"sec-fetch-site": "same-site",
          //"Referer": "https://website.admiralbet.me/",
          //"Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      })
      .then(res => res.json())
      .then((response) => {
        const neededLiveMatches = []
        response.forEach((sportType) => {
          sportType.regions.forEach((region) => {
            region.competitions.forEach((competition) => {
              competition.events.forEach((event) => {
                if (compareMatch(event.name)) neededLiveMatches.push(event.name);
              });
            });
          });
        });
        this.setState({ resultsAdmiral: neededLiveMatches.map(m => m + liveInd).concat(neededPreMatches) });
      })
      .catch(e => console.error);
    })
    .catch(e => console.error);

    // -----
    // PREMIER
    // -----
    
    //let url = `https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://web2.premierbet.me/balance9876/user/logged`;

    fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://web2.premierbet.me/live-revision.json.gz`, {
      "body": null,
      "method": "GET"
    })
    .then(response => response.json())
    .then((response) => {
      console.log(response);
      if (!response.events) return;
      const matches = Object.values(response.events);

      const neededMatches = matches.filter((match) => {
        const matchString = match.participant_1.name + ' - ' + match.participant_2.name;
        return new RegExp(searchState.query, 'i').test(matchString);
      });

      const resultLive = neededMatches.map((match) => {
        return {
          name: match.participant_1.name + ' - ' + match.participant_2.name
        };
      });

      fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://web2.premierbet.me/nolive-revision.json.gz`, {
        
        "body": null,
        "method": "GET"
      })
      .then(response => response.json())
      .then((response) => {
        if (!response.events) return;

        const matches = Object.values(response.events);

        const neededMatches = matches.filter((match) => {
          if (match.id_status !== 1) return false;
          const matchString = match.participant_1.name + ' - ' + match.participant_2.name;
          const matchDate = new Date(match.start_time);
          if (matchDate <= Date.now()) return false;
          return new RegExp(searchState.query, 'i').test(matchString);
        });

        const resultPrematches = neededMatches.map((match) => {
          return {
            name: match.participant_1.name + ' - ' + match.participant_2.name
          };
        });

        let resultsPremier = resultLive.map((elem) => ({ name: elem.name + ' --- LIVE ---'})).concat(resultPrematches);

        this.setState({ resultsPremier });

      }).catch((e) => console.error);

    }).catch((e) => console.error);

    // -----
    // SBBET
    // -----

    fetch("https://n-go-grpc.sbbet.me/odds_stream.OddsStreamService/WebEventsStreamOrdered", {
      "headers": {
        "accept": "application/grpc-web-text",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/grpc-web-text",
        //"sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
        //"sec-ch-ua-mobile": "?0",
        //"sec-ch-ua-platform": "\"macOS\"",
        //"sec-fetch-dest": "empty",
        //"sec-fetch-mode": "cors",
        //"sec-fetch-site": "same-site",
        //"x-grpc-web": "1",
        //"x-user-agent": "grpc-web-javascript/0.1",
        //"Referer": "https://sbbet.me/",
        //"Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": "AAAAAAA=",
      "method": "POST"
    })
    .then(response => response.text())
        .then((response) => {
 
          const resStringUtf8 = Base64.decode(response);
          const matches = resStringUtf8.split('$');

          const neededMatches = matches.map((sub) => {
            const live = new RegExp('"FH":', 'i').test(sub) ? ' --- LIVE ---' : '';
            return sub.slice(38).split(/[^\x20-\x7E]/g)[0] + live;
          })
            .filter((match) => {
              return new RegExp(searchState.query, 'i').test(match);
            });

          const resultMatches = neededMatches.map((match) => {
            return {
              name: match
            };
          });

          this.setState({ resultsSbbet: resultMatches });
        });
    
    // -----
    // MERIDIAN
    // -----
    
    url = `https://meridianbet.me/sails/search/page?query=${searchState.query}&locale=en`;
    request({url}, (error, response, body) => {
        if (body) {
          const parsedBody = JSON.parse(body);
          if (parsedBody[0]) {
            this.setState({ resultsMeridian: parsedBody[0].events });
            
          }
        }
    });

    // -----
    // VOLCANO
    // -----

    url = `https://sportdataprovider.volcanobet.me/api/public/prematch/search?searchString=${searchState.query}`;
    request({url}, (error, response, body) => {
        if (body) {
          const parsedBody = JSON.parse(body);
          if (parsedBody[0]) {
            this.setState({ resultsVolcano: parsedBody });
          }
        }
    });

    // -----
    // MAXBET
    // -----

    url = `https://api.allorigins.win/get?url=https://api.maxbet.me/search?query=${searchState.query}`;
    
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.contents) {
        const parsedBody = JSON.parse(data.contents);
        this.setState({ resultsMaxbet: parsedBody.events });
      }
    })
    .catch((error) => console.log('ERROR: ', error));

    // Update search state
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
    const {
      searchState = {},
      resultsLobbet = {},
      resultsPremier = {},
      resultsSbbet = {},
      resultsMeridian = {},
      resultsVolcano = {},
      resultsMaxbet = {},
      resultsAdmiral = {},
      resultsZlatnik = {}
    } = this.state;

    let resultsLobbetHTML = [];
    let resultsPremierHTML = [];
    let resultsSbbetHTML = [];
    let resultsMeridianHTML = [];
    let resultsVolcanoHTML = [];
    let resultsMaxbetHTML = [];
    let resultsAdmiralHTML = [];
    let resultsZlatnikHTML = [];

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
    if (Object.keys(resultsSbbet).length !== 0) {
      resultsSbbet.map(element => {
        i++;
        resultsSbbetHTML.push(<div key={i}><p>{element.name.toString()}</p></div>);
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
        resultsVolcanoHTML.push(<p key={i}>{element.participants.map((p) => p.name).join(' - ')} {element.l ? '--- LIVE ---':''}</p>);
      });
    }
    if (Object.keys(resultsMaxbet).length !== 0) {
      resultsMaxbet.map(element => {
        i++;
        resultsMaxbetHTML.push(<p key={i}>{element.competitors.map((p) => p.name).join(' - ')} {element.live ? '--- LIVE ---':''}</p>);
      });
    }
    if (Object.keys(resultsAdmiral).length !== 0) {
      resultsAdmiral.map(element => {
        i++;
        resultsAdmiralHTML.push(<p key={i}>{element.toString()}</p>);
      });
    }
    if (Object.keys(resultsZlatnik).length !== 0) {
      resultsZlatnik.map(element => {
        i++;
        resultsZlatnikHTML.push(<p key={i}>{element.toString()}</p>);
      });
    }
    return (
      <div className="App">
        <header>
          <meta name="viewport" content="width=device-width, user-scalable=no" />
          <div>
            <InstantSearch
              searchClient={{}}
              searchState={searchState}
              onSearchStateChange={this.onSearchStateChange}
            >
              <div className='searchBox'>
                <SearchBox
                  text="search"
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
              </div>
            </InstantSearch>
          </div>
        </header>

            <div className="box">
              <span>Lobbet</span>
              {resultsLobbetHTML}
            </div>
            <div className="box">
              <span>Zlatnik</span>
              {resultsZlatnikHTML}
            </div>
            <div className="box">
              <span>Maxbet</span>
              {resultsMaxbetHTML}
            </div>
            <div className="box">
              <span>Premier</span>
              {resultsPremierHTML}
            </div>
            <div className="box">
              <span>Sbbet</span>
              {resultsSbbetHTML}
            </div>
            <div className="box">
              <span>Volcano</span>
              {resultsVolcanoHTML}
            </div>
            <div className="box">
              <span>Admiral</span>
              {resultsAdmiralHTML}
            </div>
            <div className="box">
              <span>Meridian</span>
              {resultsMeridianHTML}
            </div>
            
            <p className="by">made by Leo & Ninessa</p>
            <p className="by">donate crypto to 0xAf481A660EFb3E4C422c70dEF4D0fa2E50c7d0C7</p>
      </div>
    );
  }
}

export default App;
