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
      users: [{
        id: 0,
        name: 'Make'
      },
      {
        id: 1,
        name: 'Jorma'
      }],
      channels: [{
        id: 0,
        name: 'Status window',
        users: null
      },
      {
        id: 1,
        name: '#general',
        users: [0, 1]
      }], 
      messages: {
        0: [],
        1: [{
          type: 1,
          id: 1,
          user: 0,
          msg: 'Hei maailma!'
        },
        {
          type: 1,
          id: 2,
          user: 1,
          msg: 'Hello world!'
        }]
      },
      keycount: 3,
      currentChannel: 0
    }
    
    this.handleMessageField = this.handleMessageField.bind(this);
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
  }

  componentDidMount() {
    socket.on('new-message', this.handleIncomingMessage);
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

    console.log(this.state.messages);
  }

  handleMessageField(value) {
    this.setState( (state) => ({ messages: state.messages.concat({
        id: this.state.keycount,
        user: 'kek',
        msg: value
      }) 
    }));

    this.setState({ keycount: this.state.keycount + 1 });
  }

  render() {
    return (
      <div className="main">
        <div className="twopanels">
          <div className="sidepanel">
            <div className="sidepanel_content">
              <Header />
              <Channels />
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