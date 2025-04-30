const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

let pixels = [];

io.on('connection', (socket) => {
  socket.on('new_user', (name) => {
    socket.username = name;
  });

  socket.emit('init_pixels', pixels);

  socket.on('draw_pixel', (data) => {
    const existing = pixels.find(p => p.x === data.x && p.y === data.y);
    if (!existing) pixels.push(data);
    else Object.assign(existing, data);

    io.emit('draw_pixel', {
      ...data,
      name: socket.username || 'Anonymous'
    });
  });
});

http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
