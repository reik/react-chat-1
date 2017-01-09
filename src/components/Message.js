import React from 'react';

export default class Message extends React.Component {
  render() {
    return (
      <div className="message">
        &lt;{this.props.user}&gt; {this.props.msg}
      </div>
    );
  }
}