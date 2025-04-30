const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

app.use(express.static(__dirname));

const users = {};

io.on("connection", socket => {
  users[socket.id] = "Guest" + Math.floor(Math.random() * 1000);
  io.emit("userList", Object.values(users));

  socket.on("draw", data => {
    socket.broadcast.emit("draw", data);
  });

  socket.on("fill", data => {
    socket.broadcast.emit("fill", data);
  });

  socket.on("cursor", ({ x, y }) => {
    // (Optional: send live cursor positions here)
  });

  socket.on("chat", msg => {
    io.emit("chat", users[socket.id] + ": " + msg);
  });

  socket.on("rename", name => {
    users[socket.id] = name;
    io.emit("userList", Object.values(users));
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", Object.values(users));
  });
});

http.listen(3000, () => console.log("Server running on http://localhost:3000"));
