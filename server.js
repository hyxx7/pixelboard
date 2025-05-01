const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const canvasData = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use("/socket.io", express.static(__dirname + "/node_modules/socket.io/client-dist"));

const users = new Map();

io.on("connection", (socket) => {
  users.set(socket.id, { name: "Anonymous" });
  io.emit("users", Array.from(users.values()));

  socket.on("set_name", (name) => {
    users.set(socket.id, { name });
    io.emit("users", Array.from(users.values()));
  });

  socket.on("draw_pixel", ({ x, y, color }) => {
    canvasData.push({ x, y, color });
    socket.broadcast.emit("draw_pixel", { x, y, color });
  });

  socket.on("get_canvas", () => {
    socket.emit("canvas_data", canvasData);
  });

  socket.on("chat", (msg) => {
    const user = users.get(socket.id) || { name: "Unknown" };
    io.emit("chat", user.name + ": " + msg);
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("users", Array.from(users.values()));
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
