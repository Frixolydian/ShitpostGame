var socket = io();
var socketId;
socket.on('emitSocketId', function(data){
	sessionStorage.setItem('socketId', data);
	socketId = data;
	socket.emit('setUsername', {username: sessionStorage.getItem('username'), id: socketId})
})


socket.on('roomList', function(data){

	if (data.playercount < 2){
		document.getElementById('playersOnline').innerHTML = data.playercount + ' player online'
	}
	else{
		document.getElementById('playersOnline').innerHTML = data.playercount + ' players online'
	}
	document.getElementById('userDisplay').innerHTML = 'Welcome, ' + sessionStorage.getItem('username')

	var myNode = document.getElementById("lobbyRooms");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	var joinButton = {};
	for (var i in data.rooms){
		if (data.rooms[i].private == false){
			joinButton[i] = document.createElement('BUTTON');
			joinButton[i].className = "joinButton";
			joinButton[i].value = data.rooms[i].id.toString()
			joinButton[i].appendChild(document.createTextNode("JOIN"));
			joinButton[i].onclick = function(){joinRoom(this.value)};
			var roomDiv = document.createElement('div');
			var roomText = document.createElement('div');
			roomText.className = 'roomText';
			roomText.innerHTML = data.rooms[i].id;
			roomText.innerHTML += (' (' + Object.keys(data.rooms[i].players).length + '/8) <br> Players: ');
			for (var j in data.rooms[i].players){
				roomText.innerHTML += data.rooms[i].players[j].name;
				roomText.innerHTML += ', ';
			}
			roomText.innerHTML = roomText.innerHTML.substring(0, roomText.innerHTML.length - 2);
			roomDiv.appendChild(roomText);
			roomDiv.appendChild(joinButton[i]);
			roomDiv.className="room";
			document.getElementById('lobbyRooms').appendChild(roomDiv);
		}
	}
})