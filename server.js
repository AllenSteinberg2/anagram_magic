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
	console.log("Here")
	res.sendFile(__dirname + "/index.html")
})

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);
	io.to(socket.id).emit('ip', socket.handshake.address);
  });
  console.log(socket.handshake.address);
});

server.listen(8080, "0.0.0.0")