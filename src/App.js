import qs from 'qs';
import React, { Component } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import { Sentry } from "react-activity";
import './App.css';
import "react-activity/dist/library.css";
import Match from './Match';
import Base64 from './utils/base64';

const dateOptions = { month: "short", day: "numeric", hour: "numeric", minute: "numeric" };

class App extends Component {

  state = {
    searchState: qs.parse(window.location.search.slice(1)),
    results: {
      Lobbet: {}, Zlatnik: {}, Maxbet: {}, Premier: {}, Sbbet: {},
      Volcano: {}, Admiral: {}, Meridian: {}, Soccerbet: {}
    },
    resultsReq: {
      Lobbet: false, Zlatnik: false, Maxbet: false, Premier: false,
      Sbbet: false, Volcano: false, Admiral: false, Meridian: false,
      Soccerbet: false
    },
    matchId: null,
  };

  constructor() {
    super();
    window.addEventListener('popstate', ({ state: searchState }) => {
      this.setState({ searchState });
    });
  }

  onSearchStateChange = (searchState) => {
    const compareMatch = (input) => new RegExp(searchState.query, 'i').test(input);

    this.setState({
      resultsReq: Object.fromEntries(Object.keys(this.state.resultsReq).map((key) => [key, true])),
      results: Object.fromEntries(Object.keys(this.state.results).map((key) => [key, {}])),
    });

    // -----
    // LOBBET
    // -----
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
    const parseLobMatch = (match) => {
      return {
        id: match.id,
        sport: lobSportTable[match.sport],
        name: match.home + ' - ' + match.away,
        league: match.leagueName,
        live: false,
        date: new Date(match.kickOffTime).toLocaleString('en-us', dateOptions),
        blocked: match.blocked || match.bets ? match.bets.length == 0 : false,
        code: match.matchCode,
      };
    };

    fetch('https://www.lobbet.me/ibet/async/live/multy/1.json', {
      method: 'POST'
    })
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
        return fetch(`https://www.lobbet.me/ibet/search/matchesSearch/${searchState.query}.json`, {
          method: 'GET'
        })
          .then((res) => res.json())
          .then((resJson) => {
            if (!resJson.matches) return;
            const resultPrematches = resJson.matches.map(parseLobMatch);

            let Lobbet = resultLive.filter((m) => {
              const hasMatch = resultPrematches.find((el) => {
                return el.name == m.name;
              });
              return !hasMatch;
            }).concat(resultPrematches);
            this.setState({
              results: {...this.state.results, Lobbet},
              resultsReq: {...this.state.resultsReq, Lobbet: false}
            });
          });
      })
      .catch((error) => console.log('Lobbet req error: ', error));

    // -----
    // ZLATNIK
    // -----

    const parseZlatnikMatch = (match) => {
      return {
        id: match.Id,
        sport: match.SportName,
        name: `${match.TeamHome} - ${match.TeamAway}`,
        league: match.LeagueName,
        live: match.live,
        date: new Date(match.MatchStartTime).toLocaleString('en-us', dateOptions), // date arg in utc
        code: match.EventCode,
      };
    };
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
                  matches.push(match);
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
            const neededLiveMatches = liveMatches.filter((m) => {
              const match = parseZlatnikMatch(m);
              return compareMatch(match.name);
            });
            neededLiveMatches.forEach((match) => {
              match.live = true;
            });
            const Zlatnik = neededLiveMatches.concat(neededPreMatches).map(m => parseZlatnikMatch(m));
            this.setState({
              results: {...this.state.results, Zlatnik},
              resultsReq: {...this.state.resultsReq, Zlatnik: false}
            });
          });
      })
      .catch((error) => console.log('Zlatnik req error: ', error));

    // -----
    // ADMIRAL
    // -----
    const parseAdmiralMatch = (match) => {
      // exclusively for Admiral change match start time to utc
      const matchDate = new Date(match.dateTime);
      matchDate.setTime(matchDate.getTime() + 60 * 60 * 1000);
      return {
        id: match.id,
        sport: match.sportName,
        name: match.name,
        league: match.competitionName,
        live: match.isLive,
        date: matchDate.toLocaleString('en-us', dateOptions), // date arg in utc
        code: match.code,
        blocked: match.isLive && (match.playableBetOutcomesCount == 0)
      };
    };

    fetch(`https://quiet-sky-9919.lenkovlen9913.workers.dev/?https://webapi.admiralbet.me/SportBookCacheWeb/api/offer/SearchEventsWeb/${searchState.query}/false`, {
      "headers": {
        "officeid": "1175",
      },
      "body": null,
      "method": "GET"
    })
      .then(res => res.json())
      .then((resJson) => {
        const neededPreMatches = resJson.map((m) => parseAdmiralMatch(m));
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
                    if (compareMatch(event.name)) neededLiveMatches.push(parseAdmiralMatch(event));
                  });
                });
              });
            });
            const Admiral = neededLiveMatches.concat(neededPreMatches);
            this.setState({
              results: {...this.state.results, Admiral},
              resultsReq: {...this.state.resultsReq, Admiral: false}
            });
          });
      })
      .catch((error) => console.log('Admiral req error: ', error));

    // -----
    // PREMIER
    // -----
    const parsePremierMatch = (match) => {
      return {
        id: match.id,
        sport: match.SportName,
        name: match.participant_1.name + ' - ' + match.participant_2.name,
        league: match.c_name ? `${match.co_name}, ${match.c_name}` : null,
        live: match.live,
        date: new Date(match.start_time).toLocaleString('en-us', dateOptions), // date arg in utc
        code: match.code,
      };
    };
    fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://premierbet.me/live-revision.json.gz`, {
      "body": null,
      "method": "GET"
    })
      .then(res => res.json())
      .then((resJson) => {
        if (!resJson.events) return;
        const matches = Object.values(resJson.events).map((m) => {
          return parsePremierMatch({ live: true, ...m });
        });

        const neededLiveMatches = matches.filter((m) => {
          return new RegExp(searchState.query, 'i').test(m.name);
        });

        fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://premierbet.me/nolive-revision.json.gz`, {
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

            const neededPrematches = neededMatches.map(parsePremierMatch);

            const Premier = neededLiveMatches.concat(neededPrematches);
            this.setState({
              results: {...this.state.results, Premier},
              resultsReq: {...this.state.resultsReq, Premier: false}
            });

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
        const matches = resStringUtf8.split(/\n\$/).slice(1);

        const Sbbet = matches.map((sub) => {
          let match = {};
          if (new RegExp('"FH":', 'i').test(sub)) {
            match.live = true;
          }
          //const test = sub.split(/\x04/);
          const parsedMatchString = sub.slice(38).split(/[^\x20-\x7E]/g);
          const internalMatchCode = parsedMatchString.find((el) => {
            if (el.length <= 1) return false;
            return (el[el.length - 1] == 'Z');
          });
          match.code = internalMatchCode.slice(0, -1);
          match.name = parsedMatchString[0];
          return match;
        })
          .filter((match) => {
            return new RegExp(searchState.query, 'i').test(match.name);
          });

        this.setState({
          results: {...this.state.results, Sbbet},
          resultsReq: {...this.state.resultsReq, Sbbet: false}
        });
      })
      .catch((error) => console.log('Sbbet req error: ', error));

    // -----
    // MERIDIAN
    // -----
    const parseMeridianMatch = (match) => {
      return {
        id: match.id,
        sport: match.sportName,
        name: match.rivals.join(' - '),
        league: match.leagueName,
        live: match.isVisibleLive,
        date: new Date(match.startTime).toLocaleString('en-us', dateOptions),
        code: match.code,
      };
    };

    fetch(`https://online.meridianbet.com/betshop/api/v3/search?term=${searchState.query}&page=0`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en",
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55X2lkIjoiMTAwMDAzIiwidXNlcl9uYW1lIjoiMjM4NWE4OGMtYjMzZS00NjM2LTlhODYtYjA5NzRhMWUyMzc4ZjkyN2M5NWYtODEzNy00ZTFlLWIzODItNDk0OWRkOGM3YTdiIiwiZW1waXJlYmV0X2NvbXBhbnlfaWQiOiIzNiIsImJldHNob3BfaWQiOiIxMDA4NjkiLCJtYXJrZXRfaWQiOiIxMDAyNDIiLCJzZXNzaW9uX2lkIjoiMjM4NWE4OGMtYjMzZS00NjM2LTlhODYtYjA5NzRhMWUyMzc4ZjkyN2M5NWYtODEzNy00ZTFlLWIzODItNDk0OWRkOGM3YTdiIiwiY3JlYXRlZF9hdCI6MTcxODQ2NjgzMTQ3NCwiYXV0aG9yaXRpZXMiOlsiYWNjb3VudCJdLCJwbGF0Zm9ybSI6IldFQl9ERVNLVE9QIiwiY2xpZW50X2lkIjoid2ViLW1vbnRlbmVncm8iLCJlbXBpcmViZXRfYmV0c2hvcF9pZCI6IjE1MTkiLCJhdWQiOlsiYWNjb3VudCJdLCJleHBpcmVzX2F0IjoxNzE4NDcwNDMxNDc0LCJlbXBpcmViZXRfbWFya2V0X2lkIjoiMTI5Iiwic2NvcGUiOlsiR0VORVJBTCJdLCJleHAiOjE3MTg0NzA0MzEsImp0aSI6IjdhOWNiMjJiLWZjZGMtNDA2NS1iN2IzLWEwOWIxMTRmZWQzOCJ9.RhrSsEjusfUkJF0OAwc4fb5k7iHEZlIrvWg_HlqDOIc",

      },
    })
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.payload) {
          const Meridian = resJson.payload.events.map(parseMeridianMatch);
          this.setState({ results: {...this.state.results, Meridian } });
        }
        this.setState({ resultsReq: {...this.state.resultsReq, Meridian: false} });
        
      })
      .catch((error) => {
        console.log('Meridian req error: ', error);
      });

    // -----
    // VOLCANO
    // -----
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
    const parseVolcanoMatch = (match) => {
      return {
        id: match.id,
        sport: volcanoSportTable[match.sportId],
        name: match.participants.map((p) => p.name).join(' - '),
        league: match.leagueName,
        live: match.l,
        date: new Date(match.date).toLocaleString('en-us', dateOptions),
      };
    };
    fetch(`https://sportdataprovider.volcanobet.me/api/public/prematch/search?searchString=${searchState.query}`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson[0]) {
          const Volcano = resJson.map(parseVolcanoMatch);
          this.setState({ results: {...this.state.results, Volcano} });
        }
        this.setState({ resultsReq: {...this.state.resultsReq, Volcano: false} });
      })
      .catch((error) => {
        console.log('Volcano req error: ', error);
      });

    // -----
    // MAXBET
    // -----
    const parseMaxbetMatch = (match) => {
      const dateString = match.utc_scheduled.replace(' ', 'T') + '.000Z';
      return {
        id: match.id,
        sport: match.sport.name, //
        name: match.competitors.map((p) => p.name).join(' - '), //
        league: match.tournament.name, //
        live: match.live, //
        date: new Date(dateString).toLocaleString('en-us', dateOptions), //
        blocked: match.event_status == 'STOPPED' || !match.active_market_count || !match.active_oddtype_count, //|| (match.event_status == 'RUNNING' && !match.current_time)
        code: match.listCode,
      };
    };

    fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://api.maxbet.me/search?query=${searchState.query}&markets=ofb,ofbs,oa0s,of0s,obb,obbs,otn,otns,oih,oihs,ohb,ohbs,ovb,ovbs,ott,oaf,oafs,obm,obs,odt,owp,owps,oft,orb,org,osn,o3x3,obf,ocr,obx,omm,oe0s,,lfb,lbb,ltn,lih,lhb,lvb,ltt,laf,lbm,lbs,lbv,les,ldt,lwp,lft,lrb,lsn,lef,lvf`)
      .then((res) => res.json())
      .then((resJson) => {
        const Maxbet = resJson.events.filter(m => !m.finished).map(parseMaxbetMatch);
        this.setState({
          results: {...this.state.results, Maxbet},
          resultsReq: {...this.state.resultsReq, Maxbet: false}
        });
      })
      .catch((error) => console.log('Maxbet req error: ', error));
    
    // -----
    // SOCCERBET
    // -----
    const soccerSportTable = {
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
    const parseSoccerbetMatch = (match) => {
      return {
        id: match.id,
        sport: soccerSportTable[match.sport], //
        name: `${match.home} - ${match.away}`, //
        league: match.leagueName, //
        live: false, //
        date: new Date(match.kickOffTime).toLocaleString('en-us', dateOptions), //
        blocked: match.blocked,
        code: match.matchCode,
      };
    };
    fetch(`https://www.soccerbet.me/restapi/offer/sr_ME/search/${searchState.query}/mob?annex=0&mobileVersion=2.27.13&locale=sr_ME`)
      .then((res) => res.json())
      .then((resJson) => {
        const Soccerbet = resJson.esMatches.map(parseSoccerbetMatch);
        this.setState({
          results: {...this.state.results, Soccerbet},
          resultsReq: {...this.state.resultsReq, Soccerbet: false}
        });
        // Fetch live
        //return fetch('https://www.soccerbet.me/live/events/sr_ME')
        //  .then((res) => res.text())
        //  .then((resText) => {
            //const a = resText.split('data:');
            //const b = JSON.parse(a[1]);
        //  });
      })
      .catch((error) => console.log('Soccerbet req error: ', error));

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
      results = {},
      resultsReq = {},
      searchState = {},
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
    let resultsSoccerbetHTML = [];

    let i = 0;
    if (Object.keys(results.Lobbet).length !== 0) {
      results.Lobbet.map(element => {
        i++;
        resultsLobbetHTML.push(<Match key={i} {...element} />);
        //resultsLobbetHTML.push(<div key={i}><p>{element.name.toString()}</p></div>);
      });
    }
    if (Object.keys(results.Premier).length !== 0) {
      results.Premier.map(element => {
        i++;
        resultsPremierHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(results.Sbbet).length !== 0) {
      results.Sbbet.map(element => {
        i++;
        resultsSbbetHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(results.Meridian).length !== 0) {
      results.Meridian.map(element => {
        i++;
        resultsMeridianHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(results.Volcano).length !== 0) {
      results.Volcano.map(element => {
        i++;
        resultsVolcanoHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(results.Maxbet).length !== 0) {
      results.Maxbet.map(element => {
        i++;
        resultsMaxbetHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(results.Admiral).length !== 0) {
      results.Admiral.map(element => {
        i++;
        resultsAdmiralHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(results.Zlatnik).length !== 0) {
      results.Zlatnik.map(element => {
        i++;
        resultsZlatnikHTML.push(<Match key={i} {...element} />);
      });
    }
    if (Object.keys(results.Soccerbet).length !== 0) {
      results.Soccerbet.map(element => {
        i++;
        resultsSoccerbetHTML.push(<Match key={i} {...element} />);
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
                  autoFocus
                  searchAsYouType={false}
                />
              </div>
            </InstantSearch>
          </div>
        </header>

        <div className={resultsReq.Admiral ? "box d" : "box"}>
          <span class="bname">Admiral</span>
          {resultsReq.Admiral ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsAdmiralHTML}
        </div>
        <div className={resultsReq.Volcano ? "box d" : "box"}>
          <span class="bname">Volcano</span>
          {resultsReq.Volcano ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsVolcanoHTML}
        </div>
        <div className={resultsReq.Lobbet ? "box d" : "box"}>
          <span class="bname">Lobbet</span>
          {resultsReq.Lobbet ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsLobbetHTML}
        </div>
        <div className={resultsReq.Soccerbet ? "box d" : "box"}>
          <span class="bname">Soccerbet</span>
          {resultsReq.Soccerbet ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsSoccerbetHTML}
        </div>
        <div className={resultsReq.Meridian ? "box d" : "box"}>
          <span class="bname">Meridian</span>
          {resultsReq.Meridian ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsMeridianHTML}
        </div>
        <div className={resultsReq.Sbbet ? "box d" : "box"}>
          <span class="bname">Sbbet</span>
          {resultsReq.Sbbet ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsSbbetHTML}
        </div>
        <div className={resultsReq.Maxbet ? "box d" : "box"}>
          <span class="bname">Maxbet</span>
          {resultsReq.Maxbet ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsMaxbetHTML}
        </div>
        <div className={resultsReq.Premier ? "box d" : "box"}>
          <span class="bname">Premier</span>
          {resultsReq.Premier ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsPremierHTML}
        </div>
        <div className={resultsReq.Zlatnik ? "box d" : "box"}>
          <span class="bname">Zlatnik</span>
          {resultsReq.Zlatnik ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsZlatnikHTML}
        </div>
        
        <p className="by">made by Leo & Ninessa</p>
        <p className="by">donate crypto to 0xAf481A660EFb3E4C422c70dEF4D0fa2E50c7d0C7</p>
      </div>
    );
  }
}

export default App;
