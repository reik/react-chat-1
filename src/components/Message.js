import React from 'react';

export default class Message extends React.Component {
  render() {
    return (
      <li className="message">
        &lt;{this.props.user}&gt; {this.props.msg}
      </li>
    );
  }
}