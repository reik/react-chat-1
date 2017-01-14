import React from 'react';
import Channel from './Channel';

export default class Channels extends React.Component {
    
  render() {
    return (
      <div className="channels">
        <strong>Channels</strong>
        
        <ul className="channellist">
          {
            Object.keys(this.props.channels).map((channelID) => 
              <Channel key={channelID} channelID={channelID} changeChannel={this.props.changeChannel} name={this.props.channels[channelID].name} />  
            )
          }
        </ul>
      </div>
    );
  }
}