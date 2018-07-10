var selectedCard = 0;
var selectedTemplate = 0;
var selectedVote = null;

socket.on('updateTurnTimer', function(data){
	document.getElementById('turnTimer').innerHTML = data.message + ' ' + Math.floor(data.turnTimer / 5);
})

socket.on('updateCards', function(data){
	console.log(data)
	document.getElementById('cards').hidden = false;
	document.getElementById('templates').hidden = false;
	document.getElementById('memes').hidden = true;
	for (var i = 0; i < 5; i++){
		document.getElementById('playerCard' + i).src = "../assets/images/image" + data.cards[i] + ".png"
	}
	for (var i = 0; i < 3; i++){
		document.getElementById('playerTemplate' + i).src = "../assets/templates/template" + data.templates[i] + ".png"
	}
	document.getElementById('reroll').value = 'Re-roll (' + data.rerolls + ')';
})

socket.on('everyoneVote', function(data){
	document.getElementById('cards').hidden = true;
	document.getElementById('templates').hidden = true;
	document.getElementById('memes').hidden = false;
	for (var i = 0; i < 10; i++){
		document.getElementById('memeContainer' + i).hidden = true;
		document.getElementById('memetext' + i).innerHTML = '';
	}
	for (var i = 0; i < data.length; i++){
		if (data[i].id !== socketId){
			document.getElementById('memeContainer' + i).hidden = false;
			makeMeme(data[i].template, data[i].image, 'meme' + i);
			document.getElementById('meme' + i).value = data[i].order;
		}
	}
})

socket.on('results', function(data){
//	document.getElementById('cards').hidden = false;
//	document.getElementById('templates').hidden = false;
//	document.getElementById('memes').hidden = true;
	for (var i = 0; i < data.length; i++){
		document.getElementById('memeContainer' + i).hidden = false;
		makeMeme(data[i].template, data[i].image, 'meme' + i);
		document.getElementById('memetext' + i).innerHTML = data[i].name + "\n +" + data[i].votes;
	}
})

function inputVote(meme){
	for (var i = 0; i < 10; i++){
		document.getElementById('meme' + i).style.borderWidth = "0px";
	}
	document.getElementById('meme' + meme).style.borderWidth = "5px";
	socket.emit('inputVote', {id: socketId, vote: meme})
}

function inputCard(card){
	socket.emit('inputCard', {id: socketId, card: card})
	selectedCard = card;
	for (var i = 0; i < 5; i++){
		document.getElementById('playerCard' + i).border = 0;
	}
	document.getElementById('playerCard' + card).border = 5;
}

function inputTemplate(template){
	socket.emit('inputTemplate', {id: socketId, template: template})
	selectedTemplate = template;
	for (var i = 0; i < 3; i++){
		document.getElementById('playerTemplate' + i).border = 0;
	}
	document.getElementById('playerTemplate' + template).border = 5;
}

function reRoll(){
	socket.emit('reRoll', {id: socketId});
}