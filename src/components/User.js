import React from 'react';

export default class User extends React.Component {
  render() {
    return (
      <li className="user">
        {this.props.nick}
      </li>
    );
  }
}