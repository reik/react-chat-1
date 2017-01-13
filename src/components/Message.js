import React from 'react';
import DateFormat from 'dateformat';

export default class Message extends React.Component {
  render() {
    return (
      <li className="message">
        [{DateFormat(this.props.time, 'HH:MM')}] &lt;{this.props.user}&gt; {this.props.msg}
      </li>
    );
  }
}