const socketIO = require('socket.io');
const express = require('express');
const path = require('path');
const app = module.exports.app = express();
const port = process.env.PORT || 3000;
let ticks = 0;
let time = 0;
let users = 0;
let participant = [];
let active = false;


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
const server = app.listen(port, () => {
  console.log("Listening on port: " + port);
});

const socket = socketIO(server);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function alertNewClient() {
  users +=1;
  socket.emit('connecty', 'a new user joined');
  socket.emit('numUsers', users);
  console.log('Client connected');
}

function alertRemoveClient() {
  users -=1;
  socket.emit('disconnected', 'a user left');
  console.log('Client disconnected');
  socket.emit('numUsers', users);
  
}



socket.on('connection', (socket) => {
  alertNewClient();
  participant.push(socket.id);
  console.log(participant);
  socket.on('startTimer', (msg) => {
    if (!active) {
      active = true;
    }
    else {
      active = false;
      ticks = 0;
      time = 0;
      socket.emit('time', time);
    }
  });
  socket.on('disconnect', () => {
    const index = participant.indexOf(socket.id);
    participant.splice(index, 1);
    console.log(participant);
    alertRemoveClient();
  });
});

function timeKeeper() {
  setTimeout(() => {
    if (active) {
      ticks +=1;
      
      socket.emit('time', time);
      if (ticks % 16 == 0) {
        time += 1;
      }
    }
    //intro plucks
    if (time > 1 && time < 22 && ticks % 2 == 0) {
      let params = { 
        rate: 1,
        delayTime: +((Math.random() * 0.3) + 0.1).toFixed(2),
        mix: +Math.random().toFixed(2),
        sample : getRandomInt(15)
      };
      let part = getRandomInt(participant.length);
      socket.to(participant[part]).emit('pluckParams', params);
    }
    //plucks get more sparce
    if (time > 22 && time < 32 && ticks % 4 == 0 && Math.random() > 0.5) {
      let params = { 
        rate: 1,
        delayTime: (Math.random() * 0.2) + .01,
        mix: Math.random(),
        sample : getRandomInt(15)
      };
      
      let part = getRandomInt(participant.length);
      socket.to(participant[part]).emit('pluckParams', params);
    }
    //bows overlap with plucks
    if (time > 10 && time < 45 && ticks % 28 == 0) {
      let params = { 
        rate: 1,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(28) + 15
      };
      let part = getRandomInt(participant.length);
      socket.to(participant[part]).emit('bowParams', params);
    }
    //plucks return and change pitch
    if (time > 45 && time < 85 && ticks % 4 == 0 && Math.random() > 0.2) {
      let params = { 
        rate: 1 + (Math.random() * 0.4) - 0.2,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(15)
      };
       
      let part = getRandomInt(participant.length);
      socket.to(participant[part]).emit('pluckParams', params);
    }
    //bows overlap with other bows but change pitch more
    if (time > 40 && time < 85 && ticks % 28 == 0) {
      let params = { 
        rate: 0.9 + (Math.random() * 0.5),
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(28) + 15
      }; 
      
      let part = getRandomInt(participant.length);
      socket.to(participant[part]).emit('bowParams', params);
    }
    if (time > 40 && time < 80 && ticks % 28 == 0) {
      let params = { 
        rate: 0.9 + (Math.random() * 0.5),
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(28) + 15
      }; 
       
      let part = getRandomInt(participant.length);
      socket.to(participant[part]).emit('bowParams', params);
    }
    //more plucks during the end part
    if (time > 80 && time < 108 && ticks % 2 == 0 && Math.random() > 0.1) {
      let params = {
        rate: 1,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(15)
      };
      for (let i = 0; i < participant.length; i++) {
        socket.to(participant[i]).emit('pluckParams', params);
      }
    }

    if (time == 81 && ticks % 16 == 0) {
      let params = {
        rate: 1,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : 45
      };
      //bow at the end
      for (let i = 0; i < participant.length; i++) {
        socket.to(participant[i]).emit('bowParams', params);
      }
    }
    if (time == 240) {
      time = 0;
    }
    timeKeeper();
  }, "62.5"); 
}

timeKeeper();


