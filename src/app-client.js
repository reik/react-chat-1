import React from 'react';
import ReactDOM from 'react-dom';
import ChatMain from './components/ChatMain';

window.onload = () => {
  ReactDOM.render(<ChatMain/>, document.getElementById('main'));
};