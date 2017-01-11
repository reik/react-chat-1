import React from 'react';

export default class Channel extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.changeChannel(this.props.channelID);
    e.preventDefault();
  }

  render() {
    return (
      <li className="channel">
        <a href="#" onClick={this.handleClick}>{this.props.name}</a>
      </li>
    );
  }
}