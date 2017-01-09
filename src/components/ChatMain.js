import React from 'react';
import Users from './Users';
import Messages from './Messages';
import MessageForm from './MessageForm';

export default class ChatMain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [], 
      messages: [{
        id: 1,
        user: 'Make',
        msg: 'Hei maailma!'
      },
      {
        id: 2,
        user: 'Jake',
        msg: 'Hello world!'
      }]
    }
  }

  componentDidMount() {
    socket.on('init', function() { });
  }

  render() {
    return (
      <div className="main">
        <div className="header">
          Kek
        </div>
        <div className="twopanels">
          <div className="sidepanel">
            <Users />
          </div>
          <div className="chatpanel">
            <Messages messages={this.state.messages} />
            <MessageForm />
          </div>
        </div>
      </div>
    );
  }
}