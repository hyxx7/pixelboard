const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Serve static files from "public" folder
app.use(express.static('public'));

// Store pixel data (format: { "x,y": color })
let pixelData = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send current canvas to new client
  socket.emit('load_canvas', pixelData);

  // Handle draw events
  socket.on('draw_pixel', ({ x, y, color }) => {
    const key = `${x},${y}`;
    pixelData[key] = color;

    // Broadcast to others
    socket.broadcast.emit('draw_pixel', { x, y, color });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
