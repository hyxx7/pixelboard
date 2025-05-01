const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

let pixels = {};  // store drawn pixels
let users = {};   // store connected users

io.on('connection', socket => {
  console.log('A user connected:', socket.id);

  // assign a random color and default name
  users[socket.id] = {
    name: 'Guest',
    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
  };

  // send existing pixels
  socket.emit('init_pixels', pixels);

  // update name
  socket.on('set_name', name => {
    users[socket.id].name = name;
  });

  // draw pixel
  socket.on('draw_pixel', data => {
    const key = `${data.x},${data.y}`;
    pixels[key] = data;
    socket.broadcast.emit('draw_pixel', data);
  });

  // cursor update
  socket.on('cursor', pos => {
    if (users[socket.id]) {
      io.emit('cursor', {
        id: socket.id,
        name: users[socket.id].name,
        color: users[socket.id].color,
        x: pos.x,
        y: pos.y
      });
    }
  });

  // chat
  socket.on('chat', msg => {
    if (users[socket.id]) {
      io.emit('chat', {
        name: users[socket.id].name,
        msg
      });
    }
  });

  // disconnect
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('remove_cursor', socket.id);
    console.log('User disconnected:', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
