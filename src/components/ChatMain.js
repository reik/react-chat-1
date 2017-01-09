import React from 'react';
import Users from './Users';
import Messages from './Messages';

export default class ChatMain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [], messages: []
    }
  }

  componentDidMount() {
    socket.on('init', function() { alert("KEK!"); });
  }

  render() {
    return (
      <div className="main">
        <Users />
        <Messages />
      </div>
    );
  }
}