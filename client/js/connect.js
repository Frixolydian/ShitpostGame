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

function createRoom(){
	socket.emit('newRoom', {id: sessionStorage.getItem('socketId'), username: sessionStorage.getItem('username'), private: document.getElementById('privateRoom').checked ? true : false});
}

function joinRoom(chosenRoom){
	socket.emit('joinRoom', {id: sessionStorage.getItem('socketId'), username: sessionStorage.getItem('username'), room:chosenRoom})
}


socket.on('noRoom', function(){
	alert("ROOM DOESN'T EXIST");
	document.getElementById('lobby').hidden = false;
	document.getElementById('game').hidden = true;
	socket.emit('updateRooms');
})


//return to user all match data
socket.on('getRoom', function(data){
	for (var i = 0; i <= 9; i++){
		document.getElementById('player' + i).innerHTML = '';
		document.getElementById('player' + i).hidden = true;
		document.getElementById('player' + i).style.color = '#ffffff'
	}
	for (var i in data.players){
		document.getElementById("player" + data.players[i].order).innerHTML = data.players[i].name + ': ' + data.players[i].score + "<hr>";
		document.getElementById("player" + data.players[i].order).hidden = false;
		if (data.players[i].id == socketId){
			document.getElementById('player' + data.players[i].order).style.color = '#c3d537'
		}
	}
	if (data.private == true){
		document.getElementById('roomDisplay').innerHTML = '🔒 Room ' + data.room;
	}
	else{
		document.getElementById('roomDisplay').innerHTML = 'Room ' + data.room;		
	}
	document.getElementById("lobby").hidden = true;
	document.getElementById("game").hidden = false;
	document.getElementById("cards").hidden = true;
	document.getElementById("templates").hidden = true;
	document.getElementById("reRoll").hidden = true;
	document.getElementById("results").hidden = true;
})

socket.on('newPlayer', function(data){
	for (var i in data){
		document.getElementById("player" + data[i].order).innerHTML = data[i].name + ': ' + data[i].score + "<hr>";
		document.getElementById("player" + data[i].order).hidden = false;
	}
})

socket.on('updateScores', function(data){
	for (var i in data){
		document.getElementById("player" + data[i].order).innerHTML = data[i].name + ': ' + data[i].score + "<hr>";
		document.getElementById("player" + data[i].order).hidden = false;
	}
})

socket.on('playerLeft', function(data){
	for (var i = 0; i <= 9; i++){
		document.getElementById('player' + i).innerHTML = '';
		document.getElementById('player' + i).hidden = true;
		document.getElementById('player' + i).style.color = '#ffffff'
	}
	for (var i in data.room){
		document.getElementById('player' + data.room[i].order).innerHTML = data.room[i].name + ': ' + data.room[i].score + "<hr>";
		document.getElementById('player' + data.room[i].order).hidden = false;
		if (data.room[i].id == socketId){
			document.getElementById('player' + data.room[i].order).style.color = '#c3d537'
		}
	}
})

function exitRoom(){
	socket.emit('exitRoom');
	socket.emit('updateRooms');
	document.getElementById('lobby').hidden = false;
	document.getElementById('game').hidden = true;
}