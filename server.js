const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const consonants = ["L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T", "L", "N", "R", "S", "T",
                    "D", "G", "D", "G", "D", "G", "D", "G", "D", "G", "D", "G", "D", "G", "D", "G", "D", "G",
                    "B", "C", "M", "P", "B", "C", "M", "P", "B", "C", "M", "P", "B", "C", "M", "P", "B", "C", "M", "P", "B", "C", "M", "P", "B", "C", "M", "P", "B", "C", "M", "P",
                    "F", "H", "V", "W", "Y", "F", "H", "V", "W", "Y", "F", "H", "V", "W", "Y", "F", "H", "V", "W", "Y", "F", "H", "V", "W", "Y", "F", "H", "V", "W", "Y", "F", "H", "V", "W", "Y",
                    "K", "K", "K", "K", "K", "K",
                    "J", "X", "J", "X", "J", "X",
                    "Q", "Z"]
const vowels = ["A", "E", "I", "O", "U"]

/*
app.use(bodyParser.urlencoded({
	extended:true
}));
*/

app.get("/", (req, res) => {
	console.log("a user connected");
	res.sendFile(__dirname + "/index.html");
})

io.on('connection', (socket) => {
  socket.on('CreateGame', (msg) => {
    console.log(msg);
    socket.broadcast.emit('JoinGame', 'Join Game');
	  io.to(socket.id).emit('WaitForPlayer', 'Waiting For Player To Join');
  });

  socket.on('JoinGame', (msg) => {
    console.log(msg);
  
    socket.broadcast.emit('ChooseLetters', 'choose letters bitch');
	  io.to(socket.id).emit('NotChooseLetters', 'wait your turn bitch');
  });

  socket.on('AddConsonant', (msg) => {
    console.log(msg);
    const randomElement = consonants[Math.floor(Math.random() * consonants.length)];
    io.emit('UpdateLetter', randomElement);
  });

  socket.on('AddVowel', (msg) => {
    console.log(msg);
    const randomElement = vowels[Math.floor(Math.random() * vowels.length)];
    io.emit('UpdateLetter', randomElement);
  });
});

server.listen(8080, "0.0.0.0")