import React from 'react';
import Users from './Users';
import Messages from './Messages';

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
          <div className="userspanel">
            <Users />
          </div>
          <div className="messagepanel">
            <Messages messages={this.state.messages} />
          </div>
        </div>
      </div>
    );
  }
}