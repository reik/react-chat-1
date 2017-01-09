const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'src', 'static')));

app.get('/', function response(req, res) {
    res.sendFile(path.join(__dirname, 'src', 'static', 'index.html'));
});

http.listen(port, function() {
    console.log("Listening on *:" + port);
});

var users = [];
var messages = [];

io.on('connection', function(client){
  var newUser = {
    id: client.id,
    username: "user_" + shortid.generate()
  }
  
  users.push(newUser);

  console.log('a user connected');
  console.log(newUser);
  client.emit("init");
});
