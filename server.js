const socketIO = require('socket.io');
const express = require('express');
const path = require('path');
const app = module.exports.app = express();
const port = process.env.PORT || 3000;
let users = 0;
let active = false;
let time = 0;
let participant = [];
let roots = [293.665, 587.33];
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(port, () => {
  console.log("Listening on port: " + port);
});

const io = socketIO(server);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

io.on('connection', (socket) => {
  users +=1;
  participant.push(socket.id);
  console.log(participant);
  io.emit('connecty', 'a new user joined at ');
  io.emit('numUsers', users);
  console.log('Client connected');
  socket.on("isPlaying", (isPlaying) => {
    active = isPlaying;
    io.emit('broadcastState', isPlaying);
  });
  socket.on('disconnect', () => {
    users -=1;
    io.emit('disconnected', 'a user left');
    io.emit('numUsers', users)
    const index = participant.indexOf(socket.id);
    participant.splice(index, 1);
    console.log(participant);
    if (participant.length < 1) {
      active = false;
      time = 0;
    }
  });
});
let ticks = 0;
function timeKeeper() {
  setTimeout(() => {
    if (active) {
      ticks +=1;
      io.emit('time', time);
      //io.to(participant[getRandomInt(participant.length)]).emit('note', getRandomInt(20));
      if (ticks % 16 == 0) {
        time += 1;
      }
      if (time > 2 && time < 30) {
        let part = getRandomInt(participant.length);
        let params = { 
          "root" : roots[getRandomInt(roots.length)],
          "degree" : getRandomInt(20),
          "deviation" : Math.random() * 20 - 10,
          "noteLength": 10,
          "attack": 10,
          "release": 1,
          "mix": 0
        };
        io.to(participant[part]).emit('synthParams', params);
      }
      if (time == 120) {
        time = 0;
      }
    }
    timeKeeper();
  }, "75"); 
}

timeKeeper();


