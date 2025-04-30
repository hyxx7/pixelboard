const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let canvasState = [];
let users = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
  users[socket.id] = { id: socket.id, color: userColor };

  socket.emit('init', { canvasState, users });
  io.emit('user_list', users);
  socket.broadcast.emit('user_joined', { id: socket.id, color: userColor });

  socket.on('draw_pixel', (data) => {
    canvasState.push(data);
    socket.broadcast.emit('draw_pixel', data);
  });

  socket.on('cursor_move', (pos) => {
    io.emit('cursor_update', { id: socket.id, pos });
  });

  socket.on('chat_message', (msg) => {
    io.emit('chat_message', { id: socket.id, color: userColor, msg });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
    io.emit('user_list', users);
    io.emit('user_left', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
