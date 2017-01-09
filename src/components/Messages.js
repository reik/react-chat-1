import React from 'react';
import Message from './Message'

export default class Messages extends React.Component {
  render() {
    return (
      <div className="messages">
        <ul>
          {
            this.props.messages.map((message) => 
              <Message key={message.id} user={message.user} msg={message.msg} />
            )
          }
        </ul>
      </div>
    );
  }
}