const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

const canvas = new Array(1000).fill('#FFFFFF');
const users = {};

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);
  const color = randomColor();
  users[socket.id] = { name: 'Guest', color };

  socket.emit('init', { canvas, users, id: socket.id });
  io.emit('user_update', users);

  socket.on('draw_pixel', ({ index, color }) => {
    if (index >= 0 && index < 1000) {
      canvas[index] = color;
      io.emit('draw_pixel', { index, color });
    }
  });

  socket.on('cursor', (data) => {
    socket.broadcast.emit('cursor', { id: socket.id, ...data });
  });

  socket.on('set_name', (name) => {
    if (typeof name === 'string' && name.length <= 20) {
      users[socket.id].name = name;
      io.emit('user_update', users);
    }
  });

  socket.on('chat', (msg) => {
    io.emit('chat', { id: socket.id, msg });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    socket.broadcast.emit('remove_cursor', socket.id);
    io.emit('user_update', users);
  });
});

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 60%)`;
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
