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
	document.getElementById('userDisplay').innerHTML = 'Hi, ' + sessionStorage.getItem('username')

	var myNode = document.getElementById("lobbyRooms");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}



	var joinButton = {};
	for (var i in data.rooms){
		if (data.rooms[i].private == false){
			var roomDiv = document.createElement('div'); //general container
			roomDiv.className="room";

			var roomLabel = document.createElement('div'); //upper label
			roomLabel.className="roomLabel"

			var roomName = document.createElement('div'); //room code
			roomName.className="roomName";

			var roomCount = document.createElement('div'); //how many players
			roomCount.className="roomCount";

			var roomContent = document.createElement('div'); //content
			roomContent.className="roomContent";

			var roomPlayersTitle = document.createElement('div'); //players text
			roomPlayersTitle.className="roomPlayersTitle";

			var roomPlayers = document.createElement('div'); //players
			roomPlayers.className="roomPlayers";

			joinButton[i] = document.createElement('BUTTON'); //join button
			joinButton[i].className = "roomJoinButton";
			joinButton[i].value = data.rooms[i].id.toString()
			joinButton[i].appendChild(document.createTextNode("JOIN"));
			joinButton[i].onclick = function(){joinRoom(this.value)};

			roomDiv.appendChild(roomLabel);
			roomLabel.appendChild(roomName);
			roomLabel.appendChild(roomCount);

			roomDiv.appendChild(roomContent);
			roomContent.appendChild(roomPlayersTitle);
			roomContent.appendChild(roomPlayers);
			roomContent.appendChild(joinButton[i]);

			roomName.innerHTML = data.rooms[i].id;
			roomCount.innerHTML += '(' + Object.keys(data.rooms[i].players).length + '/8)';
			for (var j in data.rooms[i].players){
				roomPlayers.innerHTML += data.rooms[i].players[j].name;
				roomPlayers.innerHTML += ', ';
			}
			roomPlayersTitle.innerHTML = 'Players:';
			roomPlayers.innerHTML = roomPlayers.innerHTML.substring(0, roomPlayers.innerHTML.length - 2);

			document.getElementById('lobbyRooms').appendChild(roomDiv);
		}
	}
})