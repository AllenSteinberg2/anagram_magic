const express = require("express")
const bodyParser = require("body-parser")
const lineReader = require('line-reader');
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
var fs = require("fs");

var consonantCount = 0;
var letterCount = 0;
var timer = 60;
var timerInterval;
var submissions = 0;
var playerOneID;
var playerTwoID;
var playerOneScore = 0
var playerTwoScore = 0;
var chooser;
var roundsLeft = 3;

function decrementTimer() {
  if (timer == 0 || submissions == 2) {
    clearInterval(timerInterval);
    io.to(playerOneID).emit("MyScore", playerOneScore)
    io.to(playerTwoID).emit("MyScore", playerTwoScore)
    io.to(playerOneID).emit("TheirScore", playerTwoScore)
    io.to(playerTwoID).emit("TheirScore", playerOneScore)
    setTimeout(reset, 2000);
  } else {
    timer--;
    console.log(timer)
    io.emit("DecrementTimer", "lol")
  }
}

function checkWord(word, cb) {
	//check word returns length of word if word is found in words.txt
	//otherwise returns 0
	var ret = 0;
	
	fs.readFile('./words.txt', 'utf8', function (err, data) {
    if (err) cb(err);
		var ret = 0
    var fileContents = data
    var fileContentsArray = fileContents.split(/\r?\n/);
		for(var i = 0; i < fileContentsArray.length; i++){
			if(fileContentsArray[i] == word){
				console.log("found " + word)
				ret = word.length
			}
		}
		console.log(ret + " " + word + ", in function");
        cb(null, ret)
    });
}

function chooseNineLetterWord(cb) {
  var word;
  fs.readFile('./words9.txt', 'utf8', function (err, data) {
    if (err) cb(err);
		var ret = ""
    var fileContents = data
    var fileContentsArray = fileContents.split(/\r?\n/);
    var randLineNum = Math.floor(Math.random() * fileContentsArray.length);
    ret = fileContentsArray[randLineNum]
    cb(null, ret)
  });
}
function reset() {
  console.log("reset :P")
  consonantCount = 0;
  letterCount = 0;
  timer = 60;
  submissions = 0;
  if (roundsLeft == -1) {
    return;
  }
  if (roundsLeft == 0) {
    console.log("no rounds left");
    chooseNineLetterWord(function(err, result){
      if(err) throw err;
      console.log("9 letter word is " + result);
      var shuffled = result.split('').sort(function(){return 0.5-Math.random()}).join('');
      io.emit('9LetterWord', shuffled);
      timerInterval = setInterval(decrementTimer, 1000);
    });
    roundsLeft--;
  }
  else {
    if (chooser == 1) {
      io.to(playerTwoID).emit('ChooseLetters', 'choose letters bitch');
      io.to(playerOneID).emit('NotChooseLetters', 'wait your turn bitch');
      chooser = 2;
      roundsLeft--;
    } else {
      io.to(playerOneID).emit('ChooseLetters', 'choose letters bitch');
      io.to(playerTwoID).emit('NotChooseLetters', 'wait your turn bitch');
      chooser = 1;
      roundsLeft--;
    }
  }
}

app.get("/", (req, res) => {
	console.log("a user connected");
	res.sendFile(__dirname + "/index.html");
})

io.on('connection', (socket) => {
  socket.on('CreateGame', (msg) => {
    console.log(msg);
    playerOneID = socket.id;
    socket.broadcast.emit('JoinGame', 'Join Game');
	  io.to(socket.id).emit('WaitForPlayer', 'Waiting For Player To Join');
  });

  socket.on('JoinGame', (msg) => {
    console.log(msg);
    playerTwoID = socket.id;
  
    chooser = 1;
    socket.broadcast.emit('ChooseLetters', 'choose letters bitch');
	  io.to(socket.id).emit('NotChooseLetters', 'wait your turn bitch');
  });

  socket.on('AddConsonant', (msg) => {
    console.log(msg);
    const randomElement = consonants[Math.floor(Math.random() * consonants.length)];
    io.emit('UpdateLetter', randomElement);
	consonantCount ++;
	letterCount ++;
	if(consonantCount == 7){
		io.to(socket.id).emit('DisableConsonant', '');
	}
	if(letterCount == 9){
		io.emit('EnterWord', 'enter word');
    timerInterval = setInterval(decrementTimer, 1000);
	}
  });

  socket.on('AddVowel', (msg) => {
    console.log(msg);
    const randomElement = vowels[Math.floor(Math.random() * vowels.length)];
    io.emit('UpdateLetter', randomElement);
	letterCount ++;
	if(letterCount == 9){
		io.emit('EnterWord', 'enter word');
    timerInterval = setInterval(decrementTimer, 1000);
	}
  });

  socket.on('SubmitWord', (msg) => {
    console.log(msg);
    submissions ++;
    checkWord(msg, function(err, result) {
      if(err) throw err;
      console.log(result + " " + msg + ", out of function");
      if (socket.id == playerOneID) {
        playerOneScore += result;
      } else {
        playerTwoScore += result;
      }
	  });
    socket.broadcast.emit('UpdateTheirWord', msg);
  })
});

server.listen(8080, "0.0.0.0")