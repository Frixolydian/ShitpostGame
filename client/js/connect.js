function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

var socket = io();
var socketId;
socket.on('emitSocketId', function(data){
	socketId = data;
	console.log(data);
//check username and room
	var username = getQueryVariable('username');
	var room = getQueryVariable('room').toUpperCase();

	//CREATE A NEW ROOM OR CONNECT TO AN EXISTING ONE
	if(getQueryVariable('newRoom') === 'Yes'){
	  socket.emit('newRoom', {id: socketId, username: username});
	}
	else{
	  socket.emit('joinRoom', {id: socketId, username: username, room:room})
	}
})

socket.on('noRoom', function(){
	alert("ROOM DOESN'T EXIST");
})


//return to user all match data
socket.on('getRoom', function(data){
	document.title = 'SPG ' + data.room
	for (var i in data.players){
		document.getElementById("player" + data.players[i].order).innerHTML = (data.players[i].order + 1) + ') ' + data.players[i].name + ': ' + data.players[i].score + "<hr>";
		document.getElementById("player" + data.players[i].order).hidden = false;
	}
})

socket.on('newPlayer', function(data){
	for (var i in data){
		document.getElementById("player" + data[i].order).innerHTML = (data[i].order + 1) + ') ' + data[i].name + ': ' + data[i].score + "<hr>";
		document.getElementById("player" + data[i].order).hidden = false;
	}
})

socket.on('updateScores', function(data){
	for (var i in data){
		document.getElementById("player" + data[i].order).innerHTML = (data[i].order + 1) + ') ' + data[i].name + ': ' + data[i].score + "<hr>";
		document.getElementById("player" + data[i].order).hidden = false;
	}
})

socket.on('playerLeft', function(data){
	for (var i = 0; i <= 9; i++){
		document.getElementById('player' + i).innerHTML = '';
		document.getElementById('player' + i).hidden = true;
	}
	for (var i in data.room){
		document.getElementById('player' + data.room[i].order).innerHTML = (data.room[i].order + 1) + ') ' + data.room[i].name + ': ' + data.room[i].score + "<hr>";
		document.getElementById('player' + data.room[i].order).hidden = false;
	}
})