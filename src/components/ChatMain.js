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
      }],
      keycount: 3
    }
    
    this.handleMessageField = this.handleMessageField.bind(this);
  }

  componentDidMount() {
    socket.on('init', function() { });
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
            <Users />
          </div>
          <div className="chatpanel">
            <Messages messages={this.state.messages} />
            <MessageForm handleSubmit={this.handleMessageField} />
          </div>
        </div>
      </div>
    );
  }
}