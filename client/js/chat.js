function inputChat(){
	if (socket){
		socket.emit('inputChat', {id: sessionStorage.getItem('socketId'), message: String(document.getElementById('chatInput').value)})
	}
	document.getElementById('chatInput').value = '';
}

window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;	
	if (key == 13) {
		inputChat();
	}
}

socket.on('updateChat', function(data){
	var chat = ''
	for (var i = 0; i < data.chatlog.length; i++){
		chat = chat + data.chatlog[i] + '<br>';
	}
	document.getElementById('chat').innerHTML = chat;
	document.getElementById('chatLog').scrollTop = document.getElementById('chatLog').scrollHeight;
})