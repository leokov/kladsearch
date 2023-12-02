import qs from 'qs';
import React, { Component } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import { Sentry } from "react-activity";
import './App.css';
import "react-activity/dist/library.css";
import Match from './Match';
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

const dateOptions = { month: "short", day: "numeric", hour: "numeric", minute: "numeric" };


var Base64 = {

  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

  // public method for encoding
  , encode: function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      }
      else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    } // Whend 

    return output;
  } // End Function encode 


  // public method for decoding
  , decode: function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }

      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }

    } // Whend 

    output = Base64._utf8_decode(output);

    return output;
  } // End Function decode 


  // private method for UTF-8 encoding
  , _utf8_encode: function (string) {
    var utftext = "";
    string = string.replace(/\r\n/g, "\n");

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    } // Next n 

    return utftext;
  } // End Function _utf8_encode 

  // private method for UTF-8 decoding
  , _utf8_decode: function (utftext) {
    var string = "";
    var i = 0;
    var c, c1, c2, c3;
    c = c1 = c2 = 0;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
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
      resultsLobbetReq: false,
      resultsPremier: {},
      resultsPremierReq: false,
      resultsSbbet: {},
      resultsSbbetReq: false,
      resultsMeridian: {},
      resultsMeridianReq: false,
      resultsVolcano: {},
      resultsVolcanoReq: false,
      resultsMaxbet: {},
      resultsMaxbetReq: false,
      resultsAdmiral: {},
      resultsAdmiralReq: false,
      resultsZlatnik: {},
      resultsZlatnikReq: false,
      matchId: null,
    };

    window.addEventListener('popstate', ({ state: searchState }) => {
      this.setState({ searchState });
    });
  }

  onSearchStateChange = (searchState) => {
    const compareMatch = (input) => new RegExp(searchState.query, 'i').test(input);

    this.setState({
      resultsLobbetReq: true,
      resultsPremierReq: true,
      resultsSbbetReq: true,
      resultsMeridianReq: true,
      resultsVolcanoReq: true,
      resultsMaxbetReq: true,
      resultsAdmiralReq: true,
      resultsZlatnikReq: true,
      resultsLobbet: {},
      resultsPremier: {},
      resultsSbbet: {},
      resultsMeridian: {},
      resultsVolcano: {},
      resultsMaxbet: {},
      resultsAdmiral: {},
      resultsLobbet: {},
      resultsZlatnik: {}
    });

    // -----
    // LOBBET
    // -----
    url = `https://www.lobbet.me/ibet/async/live/multy/1.json`;
    const parseLobMatch = (match) => {
      const lobSportTable = {
        'S': 'Football',
        'B': 'Basketball',
        'T': 'Tennis',
        'V': 'Volleyball',
        'HB': 'Handball',
        'H': 'Hockey',
        'TT': 'Table tennis',
        'E': 'Esports',
        'FS': 'Futsal',
      };
      //console.log('match: ', match);
      return {
        id: match.id,
        sport: lobSportTable[match.sport],
        name: match.home + ' - ' + match.away,
        league: match.leagueName,
        live: false,
        date: new Date(match.kickOffTime).toLocaleString('en-us', dateOptions),
        blocked: match.blocked || match.bets ? match.bets.length == 0 : false,
      };
    };

    fetch(url, { method: 'POST'})
      .then((res) => res.json())
      .then((resJson) => {
        if (!resJson.IMatchLiveContainer) return;
        
        const matches = resJson.IMatchLiveContainer.matches;
        const neededMatches = matches.filter((match) => {
          const matchString = match.home + ' - ' + match.away;
          return new RegExp(searchState.query, 'i').test(matchString) && match.showInLive;
        });

        const resultLive = neededMatches.map((match) => {
          const parsedMatch = parseLobMatch(match);
          parsedMatch.live = true;
          return parsedMatch;
        });

        // search prematches
        url = `https://www.lobbet.me/ibet/search/matchesSearch/${searchState.query}.json`;

        return fetch(url, { method: 'GET'})
          .then((res) => res.json())
          .then((resJson) => {
            if (!resJson.matches) return;
            const resultPrematches = resJson.matches.map(parseLobMatch);

            let resultsLobbet = resultLive.filter((m) => {
              const hasMatch = resultPrematches.find((el) => {
                return el.name == m.name;
              });
              return !hasMatch;
            }).concat(resultPrematches);
            this.setState({ resultsLobbet, resultsLobbetReq: false });
          });
      })
      .catch((error) => console.log('Lobbet req error: ', error));

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
        return fetch('https://apis.zlatnik.me/SportsOfferApi/api/sport/offer/v3/matches/live', {
          "body": null,
          "method": "GET"
        })
          .then(res => res.json())
          .then(resJson => {
            const liveMatches = getMatchesFromRes(resJson);
            // Search for needed matches
            const neededLiveMatches = liveMatches.filter(m => compareMatch(m));
            this.setState({
              resultsZlatnik: neededLiveMatches.map(m => m + liveInd).concat(neededPreMatches),
              resultsZlatnikReq: false
            });
          });
      })
      .catch((error) => console.log('Zlatnik req error: ', error));

    // -----
    // ADMIRAL
    // -----

    fetch(`https://quiet-sky-9919.lenkovlen9913.workers.dev/?https://webapi.admiralbet.me/SportBookCacheWeb/api/offer/SearchEventsWeb/${searchState.query}/false`, {
      "headers": {
        "officeid": "1175",
      },
      "body": null,
      "method": "GET"
    })
      .then(res => res.json())
      .then((resJson) => {
        const neededPreMatches = resJson.map((m) => ({ name: m.name }));
        // Fetch live matches, Admiral API has the search only for prematches

        // Fetch live matches
        return fetch("https://quiet-sky-9919.lenkovlen9913.workers.dev/?https://webapi.admiralbet.me/SportBookCacheWeb/api/offer/livetree/4/null/true/true/false", {
          "headers": {
            "officeid": "1175",
          },
          "body": null,
          "method": "GET"
        })
          .then(res => res.json())
          .then((resJson) => {
            const neededLiveMatches = []
            resJson.forEach((sportType) => {
              sportType.regions.forEach((region) => {
                region.competitions.forEach((competition) => {
                  competition.events.forEach((event) => {
                    if (compareMatch(event.name)) neededLiveMatches.push(event.name);
                  });
                });
              });
            });
            this.setState({
              resultsAdmiral: neededLiveMatches.map(m => ({ name: m + liveInd })).concat(neededPreMatches),
              resultsAdmiralReq: false
            });
          });
      })
      .catch((error) => console.log('Admiral req error: ', error));

    // -----
    // PREMIER
    // -----

    //let url = `https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://web2.premierbet.me/balance9876/user/logged`;

    fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://web2.premierbet.me/live-revision.json.gz`, {
      "body": null,
      "method": "GET"
    })
      .then(res => res.json())
      .then((resJson) => {
        if (!resJson.events) return;
        const matches = Object.values(resJson.events);

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
          .then(res => res.json())
          .then((resJson) => {
            if (!resJson.events) return;

            const matches = Object.values(resJson.events);

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

            let resultsPremier = resultLive.map((elem) => ({ name: elem.name + ' --- LIVE ---' })).concat(resultPrematches);

            this.setState({resultsPremier, resultsPremierReq: false });

          }).catch((e) => console.error);

      })
      .catch((error) => console.log('Premier req error: ', error));

    // -----
    // SBBET
    // -----
    fetch("https://n-go-grpc.sbbet.me/odds_stream.OddsStreamService/WebEventsStreamOrdered", {
      "headers": {
        "accept": "application/grpc-web-text",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/grpc-web-text",
      },
      "body": "AAAAAAA=",
      "method": "POST"
    })
      .then(res => res.text())
      .then((resText) => {

        const resStringUtf8 = Base64.decode(resText);
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

        this.setState({ resultsSbbet: resultMatches, resultsSbbetReq: false });
      })
      .catch((error) => console.log('Sbbet req error: ', error));

    // -----
    // MERIDIAN
    // -----
    
    url = `https://meridianbet.me/sails/search/page?query=${searchState.query}&locale=en`;
    
    fetch(url)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson[0]) this.setState({ resultsMeridian: resJson[0].events });
        this.setState({ resultsMeridianReq: false })
      })
      .catch((error) => {
        console.log('Meridian req error: ', error);
      });

    // -----
    // VOLCANO
    // -----

    url = `https://sportdataprovider.volcanobet.me/api/public/prematch/search?searchString=${searchState.query}`;

    const parseVolcanoMatch = (match) => {
      const volcanoSportTable = {
        1: 'Football',
        3: 'Basketball',
        2: 'Tennis',
        14: 'Volleyball',
        4: 'Handball',
        21: 'Hockey',
        9: 'Table tennis',
        19: 'Futsal',
      };
      return {
        id: match.id,
        sport: volcanoSportTable[match.sportId],
        name: match.participants.map((p) => p.name).join(' - '),
        league: match.leagueName,
        live: match.l,
        date: new Date(match.date).toLocaleString('en-us', dateOptions),
      };
    };
    fetch(url)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson[0]) {
          const resultsVolcano = resJson.map(parseVolcanoMatch);
          this.setState({ resultsVolcano });
        }
        this.setState({ resultsVolcanoReq: false });
      })
      .catch((error) => {
        console.log('Volcano req error: ', error);
      });

    // -----
    // MAXBET
    // -----

    url = `https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://api.maxbet.me/search?query=${searchState.query}&markets=ofb,ofbs,oa0s,of0s,obb,obbs,otn,otns,oih,oihs,ohb,ohbs,ovb,ovbs,ott,oaf,oafs,obm,obs,odt,owp,owps,oft,orb,org,osn,o3x3,obf,ocr,obx,omm,oe0s,,lfb,lbb,ltn,lih,lhb,lvb,ltt,laf,lbm,lbs,lbv,les,ldt,lwp,lft,lrb,lsn,lef,lvf`;

    const parseMaxbetMatch = (match) => {
      return {
        id: match.id,
        sport: match.sport.name, //
        name: match.competitors.map((p) => p.name).join(' - '), //
        league: match.tournament.name, //
        live: match.live, //
        date: new Date(match.utc_scheduled + "Z").toLocaleString('en-us', dateOptions), //
        blocked: match.event_status == 'STOPPED' || !match.active_market_count || !match.active_oddtype_count //|| (match.event_status == 'RUNNING' && !match.current_time)
      };
    };

    fetch(url)
      .then((res) => res.json())
      .then((resJson) => {
        //console.log('Maxbet results : ', resJson);
        const resultsMaxbet = resJson.events.filter(m => !m.finished).map(parseMaxbetMatch);
        this.setState({ resultsMaxbet, resultsMaxbetReq: false });
      })
      .catch((error) => console.log('Maxbet req error: ', error));

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
      resultsZlatnik = {},
      matchId
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
        resultsLobbetHTML.push(<Match key={i} {...element} />);
        //resultsLobbetHTML.push(<div key={i}><p>{element.name.toString()}</p></div>);
      });
    }
    if (Object.keys(resultsPremier).length !== 0) {
      resultsPremier.map(element => {
        i++;
        resultsPremierHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(resultsSbbet).length !== 0) {
      resultsSbbet.map(element => {
        i++;
        resultsSbbetHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(resultsMeridian).length !== 0) {
      resultsMeridian.map(element => {
        i++;
        resultsMeridianHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(resultsVolcano).length !== 0) {
      resultsVolcano.map(element => {
        i++;
        resultsVolcanoHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(resultsMaxbet).length !== 0) {
      resultsMaxbet.map(element => {
        i++;
        resultsMaxbetHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(resultsAdmiral).length !== 0) {
      resultsAdmiral.map(element => {
        i++;
        resultsAdmiralHTML.push(<p key={i}>{element.name.toString()}</p>);
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
          {this.state.resultsLobbetReq ? <center><Sentry /></center> : null}
          {resultsLobbetHTML}
        </div>
        <div className="box">
          <span>Zlatnik</span>
          {this.state.resultsZlatnikReq ? <center><Sentry /></center> : null}
          {resultsZlatnikHTML}
        </div>
        <div className="box">
          <span>Maxbet</span>
          {this.state.resultsMaxbetReq ? <center><Sentry /></center> : null}
          {resultsMaxbetHTML}
        </div>
        <div className="box">
          <span>Premier</span>
          {this.state.resultsPremierReq ? <center><Sentry /></center> : null}
          {resultsPremierHTML}
        </div>
        <div className="box">
          <span>Sbbet</span>
          {this.state.resultsSbbetReq ? <center><Sentry /></center> : null}
          {resultsSbbetHTML}
        </div>
        <div className="box">
          <span>Volcano</span>
          {this.state.resultsVolcanoReq ? <center><Sentry /></center> : null}
          {resultsVolcanoHTML}
        </div>
        <div className="box">
          <span>Admiral</span>
          {this.state.resultsAdmiralReq ? <center><Sentry /></center> : null}
          {resultsAdmiralHTML}
        </div>
        <div className="box">
          <span>Meridian</span>
          {this.state.resultsMeridianReq ? <center><Sentry /></center> : null}
          {resultsMeridianHTML}
        </div>

        <p className="by">made by Leo & Ninessa</p>
        <p className="by">donate crypto to 0xAf481A660EFb3E4C422c70dEF4D0fa2E50c7d0C7</p>
      </div>
    );
  }
}

export default App;
