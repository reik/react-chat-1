import React from 'react';

export default class ServerMessage extends React.Component {
  render() {
    return (
      <li className="message">
        -!- {this.props.msg}
      </li>
    );
  }
}