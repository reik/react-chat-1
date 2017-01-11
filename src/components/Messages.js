import React from 'react';
import ReactDOM from 'react-dom';
import Message from './Message';
import StatusMessage from './StatusMessage';


export default class Messages extends React.Component {
  
  componentWillUpdate() {
    var node = ReactDOM.findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      var node = ReactDOM.findDOMNode(this);
      node.scrollTop = node.scrollHeight;
    }
  }

  render() {
    return (
      <div className="messages">
        <ul className="messagelist">
          {
            this.props.messages.map((message) => {
              if (message.type == 0) {
                return <StatusMessage key={message.id} msg={message.msg} />;
              }else {
                return <Message key={message.id} user={message.sender} msg={message.msg} />;
              }
            })
          }
        </ul>
      </div>
    );
  }
}