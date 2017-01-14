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

      /*
       *
       * JOIN COMMAND
       *
       */
      if (command == 'join') {
        if (split.length < 2 || split[1].charAt(0) != '#') {
          client.emit('new-message', message({
            type: 0,
            msg: 'Wrong syntax! Usage: /join #channel'
          }, true));
        }else {
          var channelID = getChannel(split[1]);

          if (users[client.id].channels.indexOf(channelID) > -1) {
            client.emit('new-message', message({
              type: 0,
              msg: 'You\'re already on channel ' + split[1]
            }, true));
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
          client.emit('new-message', message({
            type: 0,
            msg: 'Ehh, let\'s keep the status window open, okay?' 
          }, true));
        }else {
          //implement leaving channel here
        }
      }else {
        client.emit('new-message', message({
          type: 0,
          msg: ['Unknown command: ' + command]
        }, true));
      }
    }else {
      if (data.channel != 0) {
        io.to('channel-' + data.channel).emit('new-message', message({
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

//helper function for messages
function message(data, isServerMessage) {
  data['date'] = Date.now();

  if (!isServerMessage) {
    data['id'] = messageCounter;
    messageCounter = messageCounter + 1;
  }
  return data;
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