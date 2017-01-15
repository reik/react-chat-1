import React from 'react';

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
      channels: {
        0: {
          name: 'Status window'
        }
      }, 
      messages: {
        0: []
      },
      currentChannel: 0,
      requestingNickname: false,
      statusMessageIDCounter: 0
    }
    
    //socket will be initialized in this variable
    this.socket = null;

    this.handleMessageField = this.handleMessageField.bind(this);
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
    this.handleChannelJoin = this.handleChannelJoin.bind(this);
    this.handleChannelLeave = this.handleChannelLeave.bind(this);
    this.addStatusMessage = this.addStatusMessage.bind(this);
    this.addNormalMessage = this.addNormalMessage.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleUserJoin = this.handleUserJoin.bind(this);
    this.handleUserLeave = this.handleUserLeave.bind(this);
    this.handleUserDisconnect = this.handleUserDisconnect.bind(this);
  }

  componentDidMount() {
    this.socket = io();

    this.socket.on('new-message', this.handleIncomingMessage);
    this.socket.on('request-nickname', () => { this.setState({ requestingNickname: true }) });
    this.socket.on('nickname-ok', () => { this.setState({ requestingNickname: false }) });
    this.socket.on('update-users', (data) => { this.setState({ users: data }) });
    this.socket.on('channel-join', this.handleChannelJoin);
    this.socket.on('channel-leave', this.handleChannelLeave);
    this.socket.on('channel-user-joined', this.handleUserJoin);
    this.socket.on('channel-user-left', this.handleUserLeave);
    this.socket.on('channel-user-disconnected', this.handleUserDisconnect)
    this.socket.on('disconnect', this.handleDisconnect);
  }

  handleUserJoin(data) {
    this.addStatusMessage(this.state.users[data.user].nick + ' has joined the channel', data.channel, new Date(data.date));
  }

  handleUserDisconnect(data) {
    this.addStatusMessage(this.state.users[data.user].nick + ' has disconnected', data.channel, new Date(data.date));
  }

  handleUserLeave(data) {
    this.addStatusMessage(this.state.users[data.user].nick + ' has left the channel', data.channel, new Date(data.date));
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
    var channels = this.state.channels;
    channels[data.id] = { name: data.name }

    var currentMessages = this.state.messages;
    currentMessages[data.id] = [];

    this.setState({ messages: currentMessages, currentChannel: data.id, channels: channels });

    this.addStatusMessage('Welcome to the channel!', data.id, Date.now());
  }

  handleChannelLeave(data) {
    var channels = this.state.channels;
    delete channels[data.channel];

    var messages = this.state.messages;
    delete messages[data.channel];

    this.setState({ channels: channels, messages: messages, currentChannel: 0 });
  }

  handleMessageField(value) {
    //if in nickname request mode, send set-nickname packet. Else send a message to current channel.
    if (this.state.requestingNickname) {
      this.socket.emit('set-nickname', value);
    }else {
      this.socket.emit('new-message', {
        channel: this.state.currentChannel,
        msg: value
      });
    }
  }

  handleDisconnect() {
    var onlyStatusMessages = this.state.messages[0];

    this.setState({ channels: {
        0: {
          name: 'Status window'
        }
      },
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