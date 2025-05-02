const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Always return index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- PIXEL BOARD LOGIC ---
const canvas = new Array(1000).fill('#FFFFFF'); // 1000 pixels
const users = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  const userColor = getRandomColor();
  users[socket.id] = { name: 'Guest', color: userColor };

  socket.emit('init', { canvas, users, id: socket.id });
  io.emit('user_update', users);

  socket.on('draw_pixel', ({ index, color }) => {
    if (index >= 0 && index < canvas.length) {
      canvas[index] = color;
      io.emit('draw_pixel', { index, color });
    }
  });

  socket.on('cursor_move', (pos) => {
    socket.broadcast.emit('cursor_move', { id: socket.id, ...pos });
  });

  socket.on('set_name', (name) => {
    if (name.length > 0 && name.length <= 20) {
      users[socket.id].name = name;
      io.emit('user_update', users);
    }
  });

  socket.on('chat', (msg) => {
    io.emit('chat', { id: socket.id, msg });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
    io.emit('user_update', users);
    socket.broadcast.emit('remove_cursor', socket.id);
  });
});

function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
}

server.listen(PORT, () => {
  console.log(`✅ PixelBoard running at http://localhost:${PORT}`);
});
