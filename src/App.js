import qs from 'qs';
import React, { Component } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import { Sentry } from "react-activity";
import './App.css';
import "react-activity/dist/library.css";
import Match from './Match';
import Base64 from './utils/base64';

const liveInd = ' --- LIVE ---';
let url = '';
const dateOptions = { month: "short", day: "numeric", hour: "numeric", minute: "numeric" };

class App extends Component {

  state = {
    searchState: qs.parse(window.location.search.slice(1)),
    results: {
      Lobbet: {}, Zlatnik: {}, Maxbet: {}, Premier: {}, Sbbet: {},
      Volcano: {}, Admiral: {}, Meridian: {}
    },
    resultsReq: {
      Lobbet: false, Zlatnik: false, Maxbet: false, Premier: false,
      Sbbet: false, Volcano: false, Admiral: false, Meridian: false
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
      resultsPremierReq: true,
      resultsSbbetReq: true,
      resultsMeridianReq: true,
      resultsVolcanoReq: true,
      resultsMaxbetReq: true,
      resultsAdmiralReq: true,
      resultsZlatnikReq: true,
      resultsPremier: {},
      resultsSbbet: {},
      resultsMeridian: {},
      resultsVolcano: {},
      resultsMaxbet: {},
      resultsAdmiral: {},
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
        date: matchDate.toLocaleString('en-us', dateOptions) // date arg in utc
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

    //let url = `https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://web2.premierbet.me/balance9876/user/logged`;

    const parsePremierMatch = (match) => {
      return {
        id: match.id,
        sport: match.SportName,
        name: match.participant_1.name + ' - ' + match.participant_2.name,
        league: match.c_name,
        live: match.live,
        date: new Date(match.ModifiedDate).toLocaleString('en-us', dateOptions), // date arg in utc
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

            const neededPrematches = neededMatches.map((match) => {
              return {
                name: match.participant_1.name + ' - ' + match.participant_2.name
              };
            });

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
        const matches = resStringUtf8.split('$');

        const Sbbet = matches.map((sub) => {
          let match = {};
          if (new RegExp('"FH":', 'i').test(sub)) {
            match.live = true;
          }
          match.name = sub.slice(38).split(/[^\x20-\x7E]/g)[0];
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
    
    url = `https://meridianbet.me/sails/search/page?query=${searchState.query}&locale=en`;
    
    const parseMeridianMatch = (match) => {
      return {
        id: match.id,
        sport: match.sportName,
        name: match.name,
        league: match.leagueName,
        live: match.isVisibleLive,
        date: new Date(match.startTime).toLocaleString('en-us', dateOptions),
      };
    };

    fetch(url)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson[0]) {
          const Meridian = resJson[0].events.map(parseMeridianMatch);
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
    
    url = `https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://api.maxbet.me/search?query=${searchState.query}&markets=ofb,ofbs,oa0s,of0s,obb,obbs,otn,otns,oih,oihs,ohb,ohbs,ovb,ovbs,ott,oaf,oafs,obm,obs,odt,owp,owps,oft,orb,org,osn,o3x3,obf,ocr,obx,omm,oe0s,,lfb,lbb,ltn,lih,lhb,lvb,ltt,laf,lbm,lbs,lbv,les,ldt,lwp,lft,lrb,lsn,lef,lvf`;

    const parseMaxbetMatch = (match) => {
      const dateString = match.utc_scheduled.replace(' ', 'T') + '.000Z';
      return {
        id: match.id,
        sport: match.sport.name, //
        name: match.competitors.map((p) => p.name).join(' - '), //
        league: match.tournament.name, //
        live: match.live, //
        date: new Date(dateString).toLocaleString('en-us', dateOptions), //
        blocked: match.event_status == 'STOPPED' || !match.active_market_count || !match.active_oddtype_count //|| (match.event_status == 'RUNNING' && !match.current_time)
      };
    };

    fetch(url)
      .then((res) => res.json())
      .then((resJson) => {
        const Maxbet = resJson.events.filter(m => !m.finished).map(parseMaxbetMatch);
        this.setState({
          results: {...this.state.results, Maxbet},
          resultsReq: {...this.state.resultsReq, Maxbet: false}
        });
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

        <div className={resultsReq.Lobbet ? "box d" : "box"}>
          <span class="bname">Lobbet</span>
          {resultsReq.Lobbet ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsLobbetHTML}
        </div>
        <div className={resultsReq.Zlatnik ? "box d" : "box"}>
          <span class="bname">Zlatnik</span>
          {resultsReq.Zlatnik ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsZlatnikHTML}
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
        <div className={resultsReq.Sbbet ? "box d" : "box"}>
          <span class="bname">Sbbet</span>
          {resultsReq.Sbbet ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsSbbetHTML}
        </div>
        <div className={resultsReq.Volcano ? "box d" : "box"}>
          <span class="bname">Volcano</span>
          {resultsReq.Volcano ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsVolcanoHTML}
        </div>
        <div className={resultsReq.Admiral ? "box d" : "box"}>
          <span class="bname">Admiral</span>
          {resultsReq.Admiral ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsAdmiralHTML}
        </div>
        <div className={resultsReq.Meridian ? "box d" : "box"}>
          <span class="bname">Meridian</span>
          {resultsReq.Meridian ? <center><span class="bloader"><Sentry /></span></center> : null}
          {resultsMeridianHTML}
        </div>

        <p className="by">made by Leo & Ninessa</p>
        <p className="by">donate crypto to 0xAf481A660EFb3E4C422c70dEF4D0fa2E50c7d0C7</p>
      </div>
    );
  }
}

export default App;
