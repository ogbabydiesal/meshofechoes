'use strict';

const express = require('express');
const socketIO = require('socket.io');

const app = express();

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
app.use(express.static('public'));

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on("controller", (arg) => {
    console.log(arg); //gust
    io.emit('response', arg);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

