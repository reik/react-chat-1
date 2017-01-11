import React from 'react';

export default class User extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    alert("KEK!");
    e.preventDefault();
  }

  render() {
    return (
      <li className="user">
        <a href="#" onClick={this.handleClick}>{this.props.nick}</a>
      </li>
    );
  }
}