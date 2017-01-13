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
      users: {},
      channels: [{
        id: 0,
        name: 'Status window'
      }], 
      messages: {
        0: []
      },
      currentChannel: 0,
      requestingNickname: false,
      statusMessageIDCounter: 0
    }
    
    this.handleMessageField = this.handleMessageField.bind(this);
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
    this.handleChannelJoin = this.handleChannelJoin.bind(this);
    this.addStatusMessage = this.addStatusMessage.bind(this);
    this.addNormalMessage = this.addNormalMessage.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  componentDidMount() {
    socket.on('new-message', this.handleIncomingMessage);
    socket.on('request-nickname', () => { this.setState({ requestingNickname: true }) });
    socket.on('nickname-ok', () => { this.setState({ requestingNickname: false }) });
    socket.on('update-users', (data) => { this.setState({ users: data }) });
    socket.on('channel-join', this.handleChannelJoin);
    socket.on('disconnect', this.handleDisconnect);
  }

  handleIncomingMessage(data) {
    //status message from server
    if (data.type == 0) {
      if (Array.isArray(data.msg)) {
        data.msg.forEach((singleMsg) => {
          this.addStatusMessage(singleMsg, 0, data.date);
        });
      }else {
        this.addStatusMessage(data.msg, 0, data.date);
      }
    }else if (data.type == 1) {
      this.addNormalMessage(data);
    }
  }

  addNormalMessage(data) {
    var newMessage = {
      type: 1,
      sender: this.state.users[data.sender].nick,
      id: data.id,
      date: new Date(data.date),
      msg: data.msg
    }

    var messages = this.state.messages;
    messages[data.channel].push(newMessage);
    
    this.setState({ messages: messages });
  }

  addStatusMessage(msg, channel, date) {
    var message = {
      type: 0,
      id: 'status-' + this.state.statusMessageIDCounter,
      date: new Date(date),
      msg: msg
    };

    this.setState({ statusMessageIDCounter: this.state.statusMessageIDCounter + 1 });

    var messages = this.state.messages;
    messages[channel].push(message);

    this.setState({ messages: messages });
  }

  changeChannel(value) {
    this.setState({ currentChannel: value });
  }

  handleChannelJoin(data) {
    this.setState({ channels: update(this.state.channels, {$push: [data]}) });

    var currentMessages = this.state.messages;
    currentMessages[data.id] = [];

    this.addStatusMessage('Welcome to channel!', data.id, Date.now());

    this.setState({ messages: currentMessages, currentChannel: data.id });
  }

  handleMessageField(value) {
    //if in nickname request mode, send set-nickname packet. Else send a message to current channel.
    if (this.state.requestingNickname) {
      socket.emit('set-nickname', value);
    }else {
      socket.emit('new-message', {
        channel: this.state.currentChannel,
        msg: value
      });
    }
  }

  handleDisconnect() {
    var onlyStatusMessages = this.state.messages[0];

    this.setState({ channels: [
      { 
        id: 0,
        name: 'Status window'
      }],
      messages: {
        0: onlyStatusMessages
      },
      users: {},
      currentChannel: 0
    });

    this.addStatusMessage('Disconnected from server', 0, Date.now());
  }

  render() {
    return (
      <div className="main">
        <div className="twopanels">
          <div className="sidepanel">
            <div className="sidepanel_content">
              <Header />
              <Channels channels={this.state.channels} changeChannel={this.changeChannel} />
              <Users users={this.state.users}/>
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