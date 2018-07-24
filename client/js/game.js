var selectedCard = 0;
var selectedTemplate = 0;
var selectedVote = null;
var vote = false;

socket.on('updateTurnTimer', function(data){
	document.getElementById('turnTimer').innerHTML = data.message;
	document.getElementById('timer').innerHTML = 'Time: ' + Math.floor(data.turnTimer / 5);
})

socket.on('disconnectEndGame', function(){
	document.getElementById('cards').hidden = true;
	document.getElementById('templates').hidden = true;
	document.getElementById('memes').hidden = true;
	document.getElementById('reRoll').hidden = true;
	document.getElementById('results').hidden = true;
})

socket.on('updateCards', function(data){
	document.getElementById('cards').hidden = false;
	document.getElementById('reRoll').hidden = false;
	document.getElementById('templates').hidden = false;
	document.getElementById('memes').hidden = true;
	document.getElementById('results').hidden = true;
	for (var i = 0; i < 5; i++){
		document.getElementById('playerCard' + i).src = "../assets/images/image" + data.cards[i] + ".png"
	}
	for (var i = 0; i < 3; i++){
		document.getElementById('playerTemplate' + i).src = "../assets/templates/template" + data.templates[i] + ".png"
	}
	document.getElementById('reRollCounter').src = 'assets/roll' + data.rerolls + '.png';
})

socket.on('everyoneVote', function(data){
	selectedVote = null;
	vote = false;
	document.getElementById('voteButton').style.backgroundColor = '#222741';
	document.getElementById('voteButton').style.color = '#c3d537';
	document.getElementById('reRoll').hidden = true;
	document.getElementById('cards').hidden = true;
	document.getElementById('templates').hidden = true;
	document.getElementById('memes').hidden = false;
	document.getElementById('memeDisplayCanvas').hidden = true;
	document.getElementById('memeDisplayCanvas').src = '';
	for (var i = 0; i < 10; i++){
		document.getElementById('memeContainer' + i).hidden = true;
	}
	for (var i = 0; i < data.length; i++){
		if (data[i].id !== sessionStorage.getItem('socketId')){
			document.getElementById('memeContainer' + i).hidden = false;
			makeMeme(data[i].template, data[i].image, 'meme' + i);
			document.getElementById('meme' + i).value = data[i].order;
		}
	}
})

socket.on('results', function(data){
	var results = data;
	var resultsArray = [];
	for (var i in data){
		resultsArray.push(data[i]);
	}
	var byVotes = resultsArray.slice(0);
	byVotes.sort(function(a,b) {
	    return b.votes - a.votes;
	});
	document.getElementById('reRoll').hidden = true;
	document.getElementById('cards').hidden = true;
	document.getElementById('templates').hidden = true;
	document.getElementById('memes').hidden = true;
	document.getElementById('results').hidden = false;

	for (var i = 3; i < 7; i++){
		document.getElementById('resultLabel' + i).hidden = true;
	}

	for (var i = 0; i < byVotes.length; i++){
		if (i < 3){
			makeMeme(byVotes[i].template, byVotes[i].image, 'resultMeme' + i);
			document.getElementById('resultLabel' + i).style.color = '#ffffff';
		}
		else{
			document.getElementById('resultLabel' + i).style.color = '#222741';
		}
		document.getElementById('resultLabel' + i).hidden = false;
		document.getElementById('resultLabel' + i).innerHTML = byVotes[i].name + " +" + byVotes[i].votes;
		if (byVotes[i].id == socketId){
			document.getElementById('resultLabel' + i).style.color = '#c3d537';
		}
	}
})

function inputVote(meme){
	if (vote == false){
		for (var i = 0; i < 10; i++){
			document.getElementById('memeContainer' + i).style.border = "solid 0.7px #979797";
		}
		document.getElementById('memeContainer' + meme).style.border = "solid 4px #c3d537";
		socket.emit('inputVote', {id: sessionStorage.getItem('socketId'), vote: document.getElementById('meme' + meme).value})
		selectedVote = meme;
	}
}

function inputCard(card){
	socket.emit('inputCard', {id: sessionStorage.getItem('socketId'), card: card})
	selectedCard = card;
	for (var i = 0; i < 5; i++){
		document.getElementById('playerCard' + i).style.border = "solid 1px #979797";
	}
	document.getElementById('playerCard' + card).style.border = "solid 8px #c3d537";

}

function inputTemplate(template){
	socket.emit('inputTemplate', {id: sessionStorage.getItem('socketId'), template: template})
	selectedTemplate = template;
	for (var i = 0; i < 3; i++){
		document.getElementById('playerTemplate' + i).style.border = "solid 1px #979797";
	}
	document.getElementById('playerTemplate' + template).style.border = "solid 8px #c3d537";
}

function reRoll(){
	socket.emit('reRoll', {id: sessionStorage.getItem('socketId')});
}

function voteButton(){
	if (selectedVote != null && vote == false){
		document.getElementById('voteButton').style.backgroundColor = '#c2c5d4';
		document.getElementById('voteButton').style.color = '#222741';
		vote = true;
		socket.emit('playerReady', {id:sessionStorage.getItem('socketId')})
	}
}