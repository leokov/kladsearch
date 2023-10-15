import React, { Component } from 'react';
import './App.css';

class Match extends Component {

    constructor(props) {
      super(props);

      this.state = { expanded: false };
    }

    handleClick() {
        this.setState({ expanded: !this.state.expanded });
    }
    
    //{JSON.stringify(this.props, null, 2)}
    
    render() {
        const matchName = this.props.live ? this.props.name + ' --- LIVE ---' : this.props.name;
        const matchPanel = (props) => {
            return <div className="MatchPanelExpanded">
                <div class="MatchName">{matchName}</div><br></br>
                <div>{this.props.sport} ◌ {this.props.league} ◌ {this.props.date}</div><br></br>
            </div>
        };
        return (
            <div class= "MatchPanel" onClick={() => this.handleClick()}>{this.state.expanded ? matchPanel(this.props) : matchName}</div>
        );
      }
    }
    
    export default Match;
  
