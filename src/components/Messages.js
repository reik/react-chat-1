import React from 'react';
import Message from './Message'

export default class Messages extends React.Component {
  render() {
    return (
      <div className="messages">
        <ul>
          {
            this.props.messages.map((message) => 
              <li className="message" key={message.id}>
                <Message user={message.user} msg={message.msg} />
              </li>
            )
          }
        </ul>
      </div>
    );
  }
}