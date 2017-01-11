import React from 'react';
import update from 'immutability-helper';

import Users from './Users';
import Messages from './Messages';
import MessageForm from './MessageForm';
import Header from './Header';
import Channels from './Channels';

export default class ChatMain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      channels: [{
        id: 0,
        name: 'Status window',
        users: null
      },
      {
        id: 1,
        name: '#general',
        users: null
      },
      {
        id: 2,
        name: '#secret',
        users: null
      }], 
      messages: {
        0: []
      },
      currentChannel: 0,
      requestingNickname: false
    }
    
    this.handleMessageField = this.handleMessageField.bind(this);
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
  }

  componentDidMount() {
    socket.on('new-message', this.handleIncomingMessage);
    socket.on('request-nickname', () => { this.setState({ requestingNickname: true }) });
    socket.on('nickname-ok', () => { this.setState({ requestingNickname: false }) });
  }

  handleIncomingMessage(data) {
    //server message
    if (data.type == 0) {
      var newMessage = {
        type: 0,
        id: data.id,
        msg: data.msg
      };

      this.setState({ messages: update(this.state.messages, {0: {$push: [newMessage]}}) });
    }
  }

  handleMessageField(value) {
    if (this.state.requestingNickname) {
      socket.emit('set-nickname', value);
    }
  }

  render() {
    return (
      <div className="main">
        <div className="twopanels">
          <div className="sidepanel">
            <div className="sidepanel_content">
              <Header />
              <Channels channels={this.state.channels} />
              <Users />
            </div>
          </div>
          <div className="chatpanel">
            <Messages messages={this.state.messages[this.state.currentChannel]} />
            <MessageForm handleSubmit={this.handleMessageField} />
          </div>
        </div>
      </div>
    );
  }
}