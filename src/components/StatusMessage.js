import React from 'react';
import DateFormat from 'dateformat';

export default class StatusMessage extends React.Component {
  render() {
    return (
      <li className="message">
        [{DateFormat(this.props.time, 'HH:MM')}] -!- {this.props.msg}
      </li>
    );
  }
}