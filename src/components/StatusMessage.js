import React from 'react';

export default class StatusMessage extends React.Component {
  render() {
    return (
      <li className="message">
        [{this.props.time}] -!- {this.props.msg}
      </li>
    );
  }
}