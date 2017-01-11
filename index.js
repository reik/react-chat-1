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
    console.log('Listening on *:' + port);
});

/*
 *
 * Socket.io stuff (basically the serverside functionality)
 * 
 */

var users = {};
var channels = {
  0: {
    name: 'Status window'
  }
}

var messageCounter = 0;
var channelCounter = 1;

io.on('connection', function(client){
  var newUser = {
    nick: null,
    realname: undefined
  }
  
  users[client.id] = newUser;

  console.log('-!- client (ID: '+ client.id +') connected, requesting nickname');

  //welcome the user and tell him what's up
  client.emit('new-message', message({
    type: 0,
    msg: ['Connected to server', 'Welcome! Who are you? Please enter a nickname :-)']
  }, true));

  //send username request
  client.emit('request-nickname');

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

      console.log('-!- client (ID: ' + client.id + ') changed nickname to ' + data);

      client.emit('new-message', message({
        type: 0,
        msg: ['You\'re now known as ' + data, 'You may now start chatting. If you\'re new here, type /help to get started.']
      }, true));

      client.emit('nickname-ok');
      
      io.emit('update-users', users);
    }else {
      console.log('-!- client (ID: ' + client.id + ') requested invalid nickname ' + data)

      client.emit('new-message', message({
        type: 0,
        msg: ['Invalid nickname. Allowed characters: a-z, A-Z and _']
      }, true));
    }
  });

  //Message from client
  client.on('new-message', function(data) {
    var user = users[client.id];
    var channel = channels[data.channel];

    console.log('<' + user.nick + '@' + channel.name + '> ' + data.msg);

    //it's command!
    if (data.msg.charAt(0) == '/') {
      var split = data.msg.split(' ');
      var command = split[0].substring(1);

      if (command == 'join') {
        if (split.length < 2 || split[1].charAt(0) != '#') {
          client.emit('new-message', message({
            type: 0,
            msg: ['Wrong syntax! Usage: /join #channel']
          }, true));
        }else {
          var channelID = getChannel(split[1]);

          client.emit('channel-join', {
            id: channelID,
            name: channels[channelID].name
          });
        }
      }else {
        client.emit('new-message', message({
          type: 0,
          msg: ['Unknown command: ' + command]
        }, true));
      }
    }else {
      if (data.channel != 0) {

      }else {

      }
    }

  });

  //Client disconnected
  client.on('disconnect', function() {
    delete users[client.id];
    io.emit('update-users', users);
  });

});

//helper function for messages
function message(data, isServerMessage) {
  if (!isServerMessage) {
    data['id'] = messageCounter;
    messageCounter = messageCounter + 1;
  }
  return data;
}

//helper function for finding channels with name
function getChannel(name) {
  Object.keys(channels).forEach(function(key) {
    var channelName = channels[key].name;

    if (channelName.toLowerCase() == name.toLowerCase()) {
      return key;
    }
  });

  var newChannel = {
    name: name
  }

  channels[channelCounter] = newChannel;

  channelCounter++;

  return channelCounter-1;
}

/*
MESSAGE FORMAT

{
  id: 1,
  channel: 1,
  user: 0,
  msg: 'Hei maailma!'
}

SERVERMSG (type = 0) <-- NO ID NEEDED, ID IS CLIENTSIDE IN SERVER MESSAGES

{
  type: 0,
  msg: ['kek', 'bur']
}

USER LIST FORMAT

{
  0: {
    nick: 'asd',
    realname: undefined
  }
}

*/