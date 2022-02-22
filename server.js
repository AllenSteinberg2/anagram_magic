const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(bodyParser.urlencoded({
	extended:true
}));

app.get("/", (req, res) => {
	console.log("a user connected")
	res.sendFile(__dirname + "/index.html")
})

io.on('connection', (socket) => {
  socket.on('CreateGame', (msg) => {
    console.log(msg);
    socket.broadcast.emit('JoinGame', 'Join Game');
	  io.to(socket.id).emit('WaitForPlayer', 'Waiting For Player To Join');
  });

  socket.on('JoinGame', (msg) => {
    console.log(msg);
    io.emit('StartGame', 'Game Will Start Soon')
  });
});

server.listen(8080, "0.0.0.0")