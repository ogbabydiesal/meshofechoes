const socketIO = require('socket.io');
const express = require('express');
const path = require('path');
const app = module.exports.app = express();
const port = process.env.PORT || 3000;
let users = 0;

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));


const server = app.listen(port, () => {
  console.log("Listening on port: " + port);
});

const io = socketIO(server);

io.on('connection', (socket) => {
  users +=1;
  io.emit('connecty', 'a new user joined at ');
  io.emit('numUsers', users);
  console.log('Client connected');
  socket.on("controller", (arg) => {
    console.log(arg); //gust
    io.emit('response', arg);
  });
  socket.on('disconnect', () => io.emit('disconnected', 'a user left'));
  socket.on('disconnect', () => users -=1);
  socket.on('disconnect', () => io.emit('numUsers', users));
});

let time = 0;


