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
    channels: []
  }
  
  users[client.id] = newUser;

  console.log('-!- client (ID: '+ client.id +') connected, requesting nickname');

  //welcome the user and tell him what's up
  serverMessage(client, ['Connected to server', 'Welcome! Who are you? Please enter a nickname :-)']);

  //send username request
  client.emit('request-nickname');


  /*
   *
   * Sockets coming from clients
   * 
   */

  //Client requests nickname
  client.on('set-nickname', function(data) {
    if (changeNick(client, data)) {
      serverMessage(client, 'You may now start chatting. If you\'re new here, type /help to get started.');
    }
  });

  //A message coming from client
  client.on('new-message', function(data) {
    var user = users[client.id];
    var channel = channels[data.channel];

    console.log('<' + user.nick + '@' + channel.name + '> ' + data.msg);

    //it's command!
    if (data.msg.charAt(0) == '/') {
      var split = data.msg.split(' ');
      var command = split[0].substring(1).toLowerCase();

      if (command == 'nick') {
        if (split.length < 2) {
          serverMessage(client, 'Wrong syntax! Usage: /nick newnick');
        }else {
          var oldNick = users[client.id].nick;

          if (changeNick(client, split[1])) {
            //inform user's channels about nick change
            users[client.id].channels.forEach((channelID) => {
              io.emit('channel-user-changed-nick', {
                channel: channelID,
                oldNick: oldNick,
                newNick: users[client.id].nick,
                date: Date.now()
              });
            });
          }
        }

      /*
       *
       * JOIN COMMAND
       *
       */
      }else if (command == 'join') {
        if (split.length < 2 || split[1].charAt(0) != '#') {
          serverMessage(client, 'Wrong syntax! Usage: /join #channel (Notice: channel names must begin with #)');
        }else {
          var channelID = getChannel(split[1]);

          if (users[client.id].channels.indexOf(channelID) > -1) {
            serverMessage(client, 'You\'re already on channel ' + split[1]);
          }else {
            //Tell channel id and name to user
            client.emit('channel-join', {
              id: channelID,
              name: channels[channelID].name
            });

            io.to('channel-' + channelID).emit('channel-user-joined', {
              channel: channelID,
              user: client.id,
              date: Date.now()
            });

            //Add user to the channel room (socket.io)
            client.join('channel-' + channelID);

            //Remember the channel
            users[client.id].channels.push(channelID);
          }
        }
      
      /*
       *
       * LEAVE COMMAND
       * 
       */
      }else if (command == 'leave') {
        if (data.channel == 0) {
          serverMessage(client, 'Ehh, let\'s keep the status window open, okay?');
        }else {
          //Remove user from channel (Socket.io)
          client.leave('channel-' + data.channel);

          //Remove the channel from user's inform
          users[client.id].channels.splice(users[client.id].channels.indexOf(data.channel), 1);

          //Inform other channel members
          io.to('channel-' + data.channel).emit('channel-user-left', {
            user: client.id,
            channel: data.channel,
            date: Date.now()
          });

          //Leave confirmation for client
          client.emit('channel-leave', {
            channel: data.channel
          });
        }
      
      /*
       *
       * HELP COMMAND
       * 
       */
      }else if (command == 'help') {
        serverMessage(client, ['Current commands:', '  /help - displays this help message', '  /join #channel - joins the specified channel', '  /leave - leaves the currently opened channel', '  /nick newnick - changes nickname to newnick']);

      /*
       *
       * INVALID COMMAND
       * 
       */
      }else {
        serverMessage(client, 'Unknown command: ' + command);
      }
    }else {
      if (data.channel != 0) {
//        io.to('channel-' + data.channel).emit('new-message', message({
        io.emit('new-message', message({
          type: 1,
          sender: client.id,
          msg: data.msg,
          channel: data.channel
        }));
      }
    }

  });

  //Client disconnected
  client.on('disconnect', function() {
    //inform channels that the user has disconnected
    users[client.id].channels.forEach((channel) => {
      io.to('channel-' + channel).emit('channel-user-disconnected', {
        user: client.id,
        channel: channel,
        date: Date.now()
      });
    });

    //delete client from users list and send remaining clients the updated list
    delete users[client.id];
    io.emit('update-users', users);
  });

});


function changeNick(client, nick) {
  var nicknameCheck = nicknameValid(nick);

  //check if username is valid 
  if (nicknameCheck == -1) {
    console.log('-!- client (ID: ' + client.id + ') requested a nickname that is already in use: ' + nick)

    serverMessage(client, 'That nickname is already in use. Please try another one!');

    return false;
  }else if (nicknameCheck == -2) {
    console.log('-!- client (ID: ' + client.id + ') requested invalid nickname ' + nick)

    serverMessage(client, 'Invalid nickname. Nickname must be between 3 and 20 characters, and allowed characters are a-z, A-Z, 0-9 and _');

    return false;
  }else {
    users[client.id].nick = nick;

    console.log('-!- client (ID: ' + client.id + ') changed nickname to ' + nick);

    serverMessage(client, 'You\'re now known as ' + nick);

    client.emit('nickname-ok');
    
    io.emit('update-users', users);

    return true;
  }
}

//helper function for messages
function message(data) {
  data['date'] = Date.now();

  data['id'] = messageCounter;
  messageCounter = messageCounter + 1;

  return data;
}

//reducing copy-paste
function serverMessage(client, message) {
  msg = {
    type: 0,
    msg: message,
    date: Date.now()
  }

  client.emit('new-message', msg);
}


//helper function for finding channels with name
function getChannel(name) {
  var channelID = null;

  Object.keys(channels).forEach((key) => {
    var channelName = channels[key].name;

    if (channelName.toLowerCase() == name.toLowerCase()) {
      channelID = key;
    }
  });

  if (channelID != null) {
    return channelID;
  }else {
    var newChannel = {
      name: name
    }

    channels[channelCounter] = newChannel;

    console.log('-!- New channel: ' + name + ' (ID: ' + channelCounter + ')');

    channelCounter++;

    return channelCounter-1;
  }
}

//helper function to check if nick is valid. -1 = already in use, -2 = invalid, 1 = ok!
function nicknameValid(nickname) {
  var found = false;

  Object.keys(users).forEach((userID) => {
    var used_nickname = users[userID].nick;

    if (used_nickname != null && used_nickname.toLowerCase() == nickname.toLowerCase()) {
      found = true;
    }
  });

  if (found) {
    return -1;
  }

  var nicknameRegex = /^[a-zA-Z0-9_]+$/;

  if (nickname.match(nicknameRegex) && nickname.length > 2 && nickname.length <= 20) {
    return 1;
  }

  return -2
}

/*
MESSAGE FORMAT

{
  type: 1,
  id: 1,
  channel: 1,
  sender: 0,
  date: 3424234324,
  msg: 'Hei maailma!'
}

SERVERMSG (type = 0) <-- NO ID NEEDED, ID IS CLIENTSIDE IN SERVER MESSAGES

{
  type: 0,
  date: 3424234324,
  msg: ['kek', 'bur']
}

USER LIST FORMAT

{
  0: {
    nick: 'asd',
    channels: []
  }
}

USER JOIN FORMAT

{
  channel: 1,
  user: 4,
  date: 4832842
}

USER DISCONNECT FORMAT

{
  user: 2,
  channel: 0,
  date: 4824732
}

*/
