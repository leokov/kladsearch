import qs from 'qs';
import React, { Component } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import request from 'request';
import logo from './logo.svg';
import './App.css';
//import base64 from 'base-64';
//const goog = require('goog');

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info
*
**/
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
      resultsSbbet: {},
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
                  }).map((elem) => ({ name: elem.name + ' --- LIVE ---'})).concat(resultPrematches);
                  this.setState({ resultsLobbet });
                }
              };
            }); 
          }
        }
    });

    url = `https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://www.premierbet.me/balance9876/user/logged`;
//console.log('url: ', url);
    const fetchOpts = {

      "body": "{}"
      //"mode": "cors",
      //"credentials": "include"
    };
    fetch(url, {...fetchOpts, "method": "POST"})
    .then(response => {
      //console.log('OO: ', response);
      return response.json();
    })
    .then((response) => {
      console.log('RESEPONSE: ', response);
      if (!response.live_rev) return;
      const { live_rev, basic_rev } = response;
      
      //console.log(response);
      const liveCode = live_rev.published_revision;
      const preCode = basic_rev.published_revision;
      //console.log(' liveCode: ', liveCode);
      //console.log(' preCode: ', preCode);
      const aa = {...fetchOpts, "method": "GET"};
      //console.log('AA: ', aa)
      fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://premierbet.me/static/rev/ml-${liveCode}.json`, {
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
        
        fetch(`https://solitary-wind-aed0.lenkovlen9913.workers.dev/?https://premierbet.me/static/rev/ae-${preCode}.json`, {
          
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
          let resultsPremier = resultLive.map((elem) => ({ name: elem.name + ' --- LIVE ---'})).concat(resultPrematches);
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

    }).catch((e) => {
      console.log("ERROR ::: ", e);
    });

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
          //response = response.replace(/\s/g, ''); 
          //console.log('SBBET RESPONSE: ', response);
          //const firstPart = response.split('==')[0];
          //const secPart = response.split('==')[1];
          //console.log('first: ', firstPart);
          //console.log('second: ', secPart);
          //const fString = firstPart.split('+').join('').split('/').join('') + '==';
          const resStringUtf8 = Base64.decode(response);
          console.log('resStringUtf8: ', resStringUtf8);
          
          //const matches = resStringUtf8.replace(/[^\x20-\x7E]/g, '').split('$');
          const matches = resStringUtf8.split('$');
         
          //console.log('stringById: ', stringById.map((sub) => sub.split('(')[0].slice(36)));
          
          //+ new RegExp('"FH":', 'i').test(sub) ? ' --- LIVE ---' : ''
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
        

          //const matchPresent = new RegExp(searchState.query, 'i').test(resStringUtf8);
          //console.log('resultMatches : ', resultMatches);
          //if (!response.events) return;
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
    const { searchState = {}, resultsLobbet = {}, resultsPremier = {}, resultsSbbet = {}, resultsMeridian = {}, resultsVolcano = {}, resultsMaxbet = {} } = this.state;
    //console.log('searchState: ', searchState);
    //console.log('resultsLobbet: ', resultsLobbet);
    //console.log('resultsMeridian: ', resultsMeridian);
    //console.log('resultsVolcano: ', resultsVolcano);
    //console.log('resultsMaxbet: ', resultsMaxbet);
    let resultsLobbetHTML = [];
    let resultsPremierHTML = [];
    let resultsSbbetHTML = [];
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
              <p>Sbbet</p>
              {resultsSbbetHTML}
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
