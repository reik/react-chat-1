import React from 'react';
import Channel from './Channel';

export default class Channels extends React.Component {
    
  render() {
    return (
      <div className="channels">
        <strong>Channels</strong>
        
        <ul className="channellist">
          {
            this.props.channels.map((channel) => 
              <Channel key={channel.id} name={channel.name} />  
            )
          }
        </ul>
      </div>
    );
  }
}