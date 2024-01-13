const socketIO = require('socket.io');
const express = require('express');
const path = require('path');
const app = module.exports.app = express();
const port = process.env.PORT || 3000;
let users = 0;
let time = 0;
let participant = [];

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
  io.emit('connecty', 'a new user joined');
  io.emit('numUsers', users);
  console.log('Client connected');
  socket.on("isPlaying", (isPlaying) => {
    active = isPlaying;
  });
  socket.on('disconnect', () => {
    users -=1;
    io.emit('disconnected', 'a user left');
    io.emit('numUsers', users)
    const index = participant.indexOf(socket.id);
    participant.splice(index, 1);
  });
});
let ticks = 0;
function timeKeeper() {
  setTimeout(() => {
    ticks +=1;
    io.emit('time', time);
    if (ticks % 16 == 0) {
      time += 1;
    }
    //intro plucks
    if (time > 1 && time < 22 && ticks % 2 == 0) {
      let part = getRandomInt(participant.length);
      let params = { 
        "rate": 1,
        "delayTime": +((Math.random() * 0.3) + 0.1).toFixed(2),
        "mix": +Math.random().toFixed(2),
        "sample" : getRandomInt(15)
      };
      io.to(participant[part]).emit('pluckParams', params);
    }
    //plucks get more sparce
    if (time > 22 && time < 32 && ticks % 4 == 0 && Math.random() > 0.5) {
      let part = getRandomInt(participant.length);
      let params = { 
        "rate": 1,
        "delayTime": (Math.random() * 0.2) + .01,
        "mix": Math.random(),
        "sample" : getRandomInt(15)
      };
      io.to(participant[part]).emit('pluckParams', params);
    }
    //bows overlap with plucks
    if (time > 10 && time < 45 && ticks % 28 == 0) {
      let part = getRandomInt(participant.length);
      let params = { 
        "rate": 1,
        "delayTime": (Math.random() * 0.2) + .1,
        "mix": Math.random(),
        "sample" : getRandomInt(28) + 15
      };
      io.to(participant[part]).emit('bowParams', params);
    }
    //plucks return and change pitch
    if (time > 45 && time < 85 && ticks % 4 == 0 && Math.random() > 0.2) {
      let part = getRandomInt(participant.length);
      let params = { 
        "rate": 1 + (Math.random() * 0.4) - 0.2,
        "delayTime": (Math.random() * 0.2) + .1,
        "mix": Math.random(),
        "sample" : getRandomInt(15)
      };
      io.to(participant[part]).emit('pluckParams', params);
    }
    //bows overlap with other bows but change pitch more
    if (time > 40 && time < 85 && ticks % 28 == 0) {
      let part = getRandomInt(participant.length);
      let params = { 
        "rate": 0.9 + (Math.random() * 0.5),
        "delayTime": (Math.random() * 0.2) + .1,
        "mix": Math.random(),
        "sample" : getRandomInt(28) + 15
      }; 
      io.to(participant[part]).emit('bowParams', params);
    }
    if (time > 40 && time < 80 && ticks % 28 == 0) {
      let part = getRandomInt(participant.length);
      let params = { 
        "rate": 0.9 + (Math.random() * 0.5),
        "delayTime": (Math.random() * 0.2) + .1,
        "mix": Math.random(),
        "sample" : getRandomInt(28) + 15
      }; 
      io.to(participant[part]).emit('bowParams', params);
    }
    //more plucks during the end part
    if (time > 80 && time < 108 && ticks % 2 == 0 && Math.random() > 0.1) {
      let params = {
        "rate": 1,
        "delayTime": (Math.random() * 0.2) + .1,
        "mix": Math.random(),
        "sample" : getRandomInt(15)
      };
      for (let i = 0; i < participant.length; i++) {
        io.to(participant[i]).emit('pluckParams', params);
      }
    }
    if (time == 81 && ticks % 16 == 0) {
      let params = {
        "rate": 1,
        "delayTime": (Math.random() * 0.2) + .1,
        "mix": Math.random(),
        "sample" : 45
      };
      for (let i = 0; i < participant.length; i++) {
        io.to(participant[i]).emit('bowParams', params);
      }      
    }
    if (time == 120) {
      time = 0;
    }
    timeKeeper();
  }, "62.5"); 
}

timeKeeper();


