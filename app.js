//search which room is the id from
function searchRoom(id){
	for (var i in ROOM_LIST){
		for (var j in ROOM_LIST[i].players){
			if (id === ROOM_LIST[i].players[j].id){
				return ROOM_LIST[i].id;
			}
		}
	}
}
//search for player with id
function searchId(id){
	for (var i in ROOM_LIST){
		for (var j in ROOM_LIST[i].players){
			if (id === ROOM_LIST[i].players[j].id){
				return ROOM_LIST[i].players[j];
			}
		}
	}
}
//4 letter code creation
var characters_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function createCode(){
	var code = '';
	for (var i = 1; i <= 4; i++){		
		code = code + characters_string.substr(Math.floor(Math.random()* 26 ), 1)
	}
	return code;
}

//CLASSES LOAD
var m = require('./classes');

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var path = require('path');

var clientPath = path.join(__dirname, 'client');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(clientPath));

//app.use('/client', express.static(__dirname + '/client'));


serv.listen(process.env.PORT || 2000);
console.log('Server started.')


var SOCKET_LIST = {};
var ROOM_LIST = {};
var PLAYER_LIST = {};


var io = require('socket.io')(serv,{});
var m = require('./classes');


//when connecting to game
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	var socket_id = socket.id;
	SOCKET_LIST[socket.id] = socket;

	socket.emit('emitSocketId', socket_id);
	socket.emit('roomList', {rooms: ROOM_LIST, playercount: io.engine.clientsCount});

	socket.on('updateRooms', function(){
		socket.emit('roomList', {rooms: ROOM_LIST, playercount: io.engine.clientsCount});
	})

	socket.on('setUsername', function(data){
		PLAYER_LIST[data.id] = {id: data.id, username: data.username}
	})

	socket.on('newRoom', function(data){
		var code = createCode();
		var player = m.Player(data.id, data.username, 0);
		var room = m.Room(code, data.private);
		room.players[data.id] = player;
		ROOM_LIST[code] = room;
		socket.emit('getRoom', {players: ROOM_LIST[code].players, room: room.id, private: data.private})
//notify chat
		ROOM_LIST[code].chatlog.push('-' + player.name + ' connected-')
	})

	socket.on('joinRoom', function(data){
		if(ROOM_LIST[data.room] !== undefined){
			var player = m.Player(data.id, data.username, Object.keys(ROOM_LIST[data.room].players).length)
			ROOM_LIST[data.room].players[data.id] = player;
			if (ROOM_LIST[data.room].gameStart == true){
				ROOM_LIST[data.room].players[data.id].inGame = true; //put in game if the game has started
				ROOM_LIST[data.room].players[data.id].getCards(SOCKET_LIST)
			}
			socket.emit('getRoom', {players: ROOM_LIST[data.room].players, room: data.room, private: ROOM_LIST[data.room].private})
			//update all other players
			for (var i in ROOM_LIST[data.room].players){
				SOCKET_LIST[ROOM_LIST[data.room].players[i].id].emit('newPlayer', ROOM_LIST[data.room].players);
			}
			//notify chat
			ROOM_LIST[data.room].chatlog.push('-' + player.name + ' connected-')
			ROOM_LIST[data.room].gameManager(SOCKET_LIST);
		}
		else{
			socket.emit('noRoom');
		}
	})

//receive players' input
	socket.on('inputChat', function(data){
		if(searchRoom(data.id)){
			var player = searchId(data.id);
			ROOM_LIST[searchRoom(data.id)].chatlog.push(player.name + ': ' + data.message)
			//update everyone chat
		}
	})
	socket.on('inputCard', function(data){
		if(searchRoom(data.id)){
			var player = searchId(data.id);
			ROOM_LIST[searchRoom(data.id)].players[data.id].chosenCard = data.card;
		}
	})
	socket.on('inputTemplate', function(data){
		if(searchRoom(data.id)){
			var player = searchId(data.id);
			ROOM_LIST[searchRoom(data.id)].players[data.id].chosenTemplate = data.template;
		}
	})
	socket.on('inputVote', function(data){
		if(searchRoom(data.id)){
			var player = searchId(data.id);
			ROOM_LIST[searchRoom(data.id)].players[data.id].vote = data.vote;
		}
	})
	socket.on('reRoll', function(data){
		if(searchRoom(data.id)){
			if(ROOM_LIST[searchRoom(data.id)].gameStart == true){
				ROOM_LIST[searchRoom(data.id)].players[data.id].reRoll(SOCKET_LIST);
			}
		}
	})
	socket.on('playerReady', function(data){
		if(searchRoom(data.id)){
			ROOM_LIST[searchRoom(data.id)].players[data.id].ready = true;
			if(ROOM_LIST[searchRoom(data.id)].gameStart == true){
				ROOM_LIST[searchRoom(data.id)].checkReady();
			}
		}
	})


	socket.on('exitRoom', function(){
		//remove player from room
		for (var i in ROOM_LIST){
			for (var j in ROOM_LIST[i].players){
				if (socket.id == j){
//order remaining players
					ROOM_LIST[i].orderPlayers(ROOM_LIST[i].players[socket.id].order);
//save first then delete player
					var player = ROOM_LIST[i].players[socket.id]
					delete ROOM_LIST[i].players[socket.id];
//notify chat
					ROOM_LIST[i].chatlog.push('-' + player.name + ' disconnected-')
//send removed player to all remaining
					for (var j in ROOM_LIST[i].players){
						SOCKET_LIST[ROOM_LIST[i].players[j].id].emit('playerLeft', {player: player, room: ROOM_LIST[i].players});
					}
//stop game if only two remain
					ROOM_LIST[i].gameManager(SOCKET_LIST);
//delete if empty
					if(Object.keys(ROOM_LIST[i].players) == 0){
						delete ROOM_LIST[i];
					}
				}
			}
		}
	})


	socket.on('disconnect', function(){
//remove from player list
		delete SOCKET_LIST[socket.id];
		players_connected =- 1;
//remove player from room
		for (var i in ROOM_LIST){
			for (var j in ROOM_LIST[i].players){
				if (socket.id == j){
//order remaining players
					ROOM_LIST[i].orderPlayers(ROOM_LIST[i].players[socket.id].order);
//save first then delete player
					var player = ROOM_LIST[i].players[socket.id]
					delete ROOM_LIST[i].players[socket.id];
//notify chat
					ROOM_LIST[i].chatlog.push('-' + player.name + ' disconnected-')
//send removed player to all remaining
					for (var j in ROOM_LIST[i].players){
						SOCKET_LIST[ROOM_LIST[i].players[j].id].emit('playerLeft', {player: player, room: ROOM_LIST[i].players});
					}
//stop game if only two remain
					ROOM_LIST[i].gameManager(SOCKET_LIST);
//delete if empty
					if(Object.keys(ROOM_LIST[i].players) == 0){
						delete ROOM_LIST[i];
					}
				}
			}
		}
	})
});


setInterval(function(){
//update chat
	for (var i in ROOM_LIST){
		ROOM_LIST[i].update(SOCKET_LIST);
	}
}, 1000/5);