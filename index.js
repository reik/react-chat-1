const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

/*
 *
 * Express stuff
 *
*/

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'src', 'static')));

app.get('/', function response(req, res) {
    res.sendFile(path.join(__dirname, 'src', 'static', 'index.html'));
});

http.listen(port, function() {
    console.log("Listening on *:" + port);
});

/*
 *
 * Socket.io stuff (basically the serverside functionality)
 * 
 */

var users = {};
var messageCounter = 0;

io.on('connection', function(client){
  var newUser = {
    nick: null,
    realname: undefined
  }
  
  users[client.id] = newUser;

  console.log('-!- client (ID: '+ client.id +') connected, requesting username');

  //welcome the user and tell him what's up
  client.emit("new-message", message({
    type: 0,
    msg: ['Connected to server', 'Welcome! Who are you? Please enter a nickname :-)']
  }));

  //send username request
  client.emit("request-username");
});

function message(data) {
  data['id'] = messageCounter;
  messageCounter = messageCounter + 1;
  console.log(data);
  return data;
}

/*
MESSAGE FORMAT

{
  id: 1,
  channel: 1,
  user: 0,
  msg: 'Hei maailma!'
}

SERVERMSG (type = 0)

{
  id: 1,
  type: 0,
  msg: ['kek', 'bur']
}

*/