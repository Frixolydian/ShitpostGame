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
	snd_fwd.play();
}

function joinRoom(chosenRoom){
	socket.emit('joinRoom', {id: sessionStorage.getItem('socketId'), username: sessionStorage.getItem('username'), room:chosenRoom})
	snd_fwd.play();
}


socket.on('noRoom', function(){
	alert("ROOM DOESN'T EXIST");
	document.getElementById('lobby').hidden = false;
	document.getElementById('game').hidden = true;
	socket.emit('updateRooms');
	snd_back.play();
})

socket.on('roomFull', function(){
	alert("ROOM IS FULL");
	document.getElementById('lobby').hidden = false;
	document.getElementById('game').hidden = true;
	socket.emit('updateRooms');
	snd_back.play();
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
	snd_chat.play();
	for (var i in data){
		document.getElementById("player" + data[i].order).innerHTML = data[i].name + ': ' + data[i].score + "<hr>";
		document.getElementById("player" + data[i].order).hidden = false;
	}
})

socket.on('updateScores', function(data){
	for (var i in data){
		if (data[i].id == socketId){
			if (data[i].score - currentScore == 1){
				snd_point.play();
			}
			else if (data[i].score - currentScore > 1){
				snd_multipoint.play();
			}
			currentScore = data[i].score;
		}
		document.getElementById("player" + data[i].order).innerHTML = data[i].name + ': ' + data[i].score + "<hr>";
		document.getElementById("player" + data[i].order).hidden = false;
	}
})

socket.on('playerLeft', function(data){
	snd_back.play();
	for (var i = 0; i <= 9; i++){
		document.getElementById('player' + i).innerHTML = '';
		document.getElementById('player' + i).hidden = true;
		document.getElementById('player' + i).style.color = '#ffffff';
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
	snd_back.play();
	socket.emit('exitRoom');
	socket.emit('updateRooms');
	document.getElementById('lobby').hidden = false;
	document.getElementById('game').hidden = true;
}