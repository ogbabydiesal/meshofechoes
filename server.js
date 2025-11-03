const socketIO = require('socket.io');
const express = require('express');
const path = require('path');
const app = module.exports.app = express();
const port = process.env.PORT || 3000;
let ticks = 0;
let time = 0;
let users = 0;
//let participant = [];
let active = true;

let rooms = {};

//sample room object
/*
rooms = {
  roomName1: {
    participants: [socketid1, socketid2],

  },
  roomName2: {
    participants: [socketid3, socketid4],
  }
}
*/

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
  // alertNewClient();
  // participant.push(socket.id);
  // console.log(participant);
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
    console.log('Client disconnected');
    //check if socket.id is in a room and remove it
    Object.keys(rooms).forEach(roomName => {
      let index = rooms[roomName].participants.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomName].participants.splice(index, 1);
        //if room is empty, delete it
        if (rooms[roomName].participants.length === 0) {
          delete rooms[roomName];
        }
      }
    });
    //alertRemoveClient();
  });

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    if (!rooms[roomName]) {
      rooms[roomName] = {
        participants: []
      };
    }
    rooms[roomName].participants.push(socket.id) ? rooms[roomName].participants.indexOf(socket.id) === -1 : console.log('already in room');
    console.log('rooms: ', rooms);
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    if (rooms[roomName]) {
      let index = rooms[roomName].participants.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomName].participants.splice(index, 1);
        //if room is empty, delete it
        if (rooms[roomName].participants.length === 0) {
          delete rooms[roomName];
        }
      }
    }
    console.log('rooms: ', rooms);
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
      //do instruction once per room
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        let part = getRandomInt(participant.length);
        socket.to(participant[part]).emit('pluckParams', params);
      });
    }
    //plucks get more sparce
    if (time > 22 && time < 38 && ticks % 4 == 0 && Math.random() > 0.5) {
      let params = { 
        rate: 1,
        delayTime: (Math.random() * 0.2) + .01,
        mix: Math.random(),
        sample : getRandomInt(15)
      };
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        for (let i = 0; i < 4; i++) {
          let part = getRandomInt(participant.length);
          socket.to(participant[part]).emit('pluckParams', params);
        }
      });
    }
    //sparce plucks overlap with bows
    if (time > 38 && time < 165 && ticks % 4 == 0 && Math.random() > 0.5) {
      let params = { 
        rate: 1,
        delayTime: (Math.random() * 0.2) + .01,
        mix: Math.random(),
        sample : getRandomInt(15)
      };
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        for (let i = 0; i < 4; i++) {
          let part = getRandomInt(participant.length);
          socket.to(participant[part]).emit('pluckParams', params);
        }
      });
    }
    //bows overlap with plucks
    if (time > 35 && time < 165 && ticks % 28 == 0) {
      let params = { 
        rate: 1,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(28) + 15
      };
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        for (let i = 0; i < 4; i++) {
          let part = getRandomInt(participant.length);
          socket.to(participant[part]).emit('bowParams', params);
        }
      });
    }
    //plucks return and change pitch
    if (time > 165 && time < 205 && ticks % 4 == 0 && Math.random() > 0.2) {
      let params = { 
        rate: 1 + (Math.random() * 0.4) - 0.2,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(15)
      };
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        for (let i = 0; i < 4; i++) {
          let part = getRandomInt(participant.length);
          socket.to(participant[part]).emit('pluckParams', params);
        }
      });
    }
    //bows overlap with other bows but change pitch more
    if (time > 160 && time < 205 && ticks % 28 == 0) {
      let params = { 
        rate: 0.9 + (Math.random() * 0.5),
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(28) + 15
      };
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        for (let i = 0; i < 4; i++) {
          let part = getRandomInt(participant.length);
          socket.to(participant[part]).emit('bowParams', params);
        }
      });
    }
    
    //more plucks during the end part
    if (time > 200 && time < 228 && ticks % 2 == 0 && Math.random() > 0.1) {
      let params = {
        rate: 1,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : getRandomInt(15)
      };
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        for (let i = 0; i < 4; i++) {
          let part = getRandomInt(participant.length);
          socket.to(participant[part]).emit('pluckParams', params);
        }
      });
    }

    if (time == 201 && ticks % 16 == 0) {
      let params = {
        rate: 1,
        delayTime: (Math.random() * 0.2) + .1,
        mix: Math.random(),
        sample : 45
      };
      //bow at the end
      Object.keys(rooms).forEach(roomName => {
        let participant = rooms[roomName].participants;
        for (let i = 0; i < 12; i++) {
          let part = getRandomInt(participant.length);
          socket.to(participant[part]).emit('finalParams', params);
        }
      });
      
    }
    if (time == 240) {
      time = 0;
    }
    timeKeeper();
  }, "62.5"); 
}

timeKeeper();


