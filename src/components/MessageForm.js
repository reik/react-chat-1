import React from 'react';

export default class MessageForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = { value: '' };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit(e) {
    this.props.handleSubmit(this.state.value);
    this.setState({ value: '' });

    e.preventDefault();
  }

  render() {
    return (
      <div className="messageForm">
        <form onSubmit={this.handleSubmit}>
          <input value={this.state.value} onChange={this.handleChange} />
        </form>
      </div>
    );
  }
}