var socket = io();
var socketId;
socket.on('emitSocketId', function(data){
	sessionStorage.setItem('socketId', data);
	console.log(data);
	socketId = data;
})

var joinButton = {};



socket.on('roomList', function(data){
	var myNode = document.getElementById("lobbyRooms");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}

	for (var i in data){
		console.log(data[i].private)
		if (data[i].private == false){
			joinButton[i] = document.createElement('BUTTON');
			joinButton[i].className = "joinButton";
			joinButton[i].value = data[i].id.toString()
			joinButton[i].appendChild(document.createTextNode("JOIN"));
			joinButton[i].onclick = function(){joinRoom(this.value)};
			var roomDiv = document.createElement('div');
			roomDiv.innerHTML = data[i].id;
			roomDiv.innerHTML += (' (' + Object.keys(data[i].players).length + '/8)');
			roomDiv.appendChild(joinButton[i])
			roomDiv.className="room";
			document.getElementById('lobbyRooms').appendChild(roomDiv);
		}
	}
})