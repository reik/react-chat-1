import React from 'react';

export default class Message extends React.Component {
  render() {
    return (
      <li className="message">
        [{this.props.time}] &lt;{this.props.user}&gt; {this.props.msg}
      </li>
    );
  }
}