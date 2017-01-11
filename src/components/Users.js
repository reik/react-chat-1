import React from 'react';
import User from './User';

export default class Users extends React.Component {
  render() {
    return (
      <div className="users">
        <strong>Users in this channel</strong>

        <ul className="userlist">
          {
            Object.keys(this.props.users).map((userid) => 
              <User key={userid} nick={this.props.users[userid].nick} />  
            )
          }
        </ul>
      </div>
    );
  }
}