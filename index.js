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

  console.log('-!- client (ID: '+ client.id +') connected, requesting nickname');

  //welcome the user and tell him what's up
  client.emit("new-message", message({
    type: 0,
    msg: ['Connected to server', 'Welcome! Who are you? Please enter a nickname :-)']
  }));

  //send username request
  client.emit("request-nickname");

  /*
   *
   * Sockets coming from clients
   * 
   */

  client.on('set-nickname', function(data) {
    var usernameRegex = /^[a-zA-Z0-9_]+$/;
    
    /*
     
     !!!!!! TODO: DON'T ALLOW DUPLICATE OR TOO LONG NICKNAMES !!!!!!!!

     */
    
    //check if username is valid 
    if (data.match(usernameRegex)) {
      users[client.id].nick = data;

      console.log("-!- client (ID: " + client.id + ") changed nickname to " + data);

      client.emit("new-message", message({
        type: 0,
        msg: ['You\'re now known as ' + data, 'You may now start chatting. If you\'re new here, type /help to get started.']
      }));

      client.emit("nickname-ok");
    }else {
      console.log("-!- client (ID: " + client.id + ") requested invalid nickname " + data)

      client.emit("new-message", message({
        type: 0,
        msg: ['Invalid nickname. Allowed characters: a-z, A-Z and _']
      }));
    }
  });

});

function message(data) {
  data['id'] = messageCounter;
  messageCounter = messageCounter + 1;
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