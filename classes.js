//shuffle array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

var imageN = 628;
var templateN = 237;

exports.Player = function(id, name, order){
	var self = {
		id: id,
		name: name,
		order: order,
		score: 0,
		cards: [],
		templates: [],
		chosenCard: 0,
		chosenTemplate: 0,
		turn: false,
		vote: null,
		inGame: false,
		rerolls: 3,
		ready: false,
	}
	self.getCards = function(sockets){
		//draw 5 cards
		for (var i = 0; i < 5; i++){
			if (self.cards[i] == undefined){
				self.cards.push(Math.floor(Math.random()*imageN));
			}
		}
		for (var i = 0; i < 3; i++){
			if (self.templates[i] == undefined){
				self.templates.push(Math.floor(Math.random()*templateN));
			}
		}
		sockets[self.id].emit('updateCards', {cards: self.cards, templates: self.templates, rerolls: self.rerolls})
		sockets[self.id].emit('updateScores', self.players);
	}
	self.reRoll = function(sockets){
		if(self.rerolls > 0){
			self.rerolls -= 1;
			self.cards = [];
			self.templates = [];
			self.getCards(sockets);
		}
	}
	return self;
}

exports.Room = function(id, private){
	var self= {
		id: id,
		private: private,
		players: {},
		chatlog: [],
		gameStart: false,
		playerTurn: 0,
		round: 0,
		turnTimer: '',
		turnIndex: 0,
		gamePhase: 'none', //phases: DRAW, PLAY, VOTE, RESULTS, WINNER
		gameMessage: 'Waiting for players (minimum 3 required)...',
		memes: [],
		timers: [20, 130, 90, 60, 0],
		maxScore: 10,
	}
	self.checkReady = function(){
		var j = 0;
		for (var i in self.players){
			if (self.players[i].ready == true){
				j +=1;
			}
		}
		if (Object.keys(self.players).length == j){
			self.turnTimer = 0;
		}
	}
	self.orderPlayers = function(k){
		for (var i in self.players){
			if (self.players[i].order > k){
				self.players[i].order -= 1;
			}
		}
	}
	self.gameManager = function(sockets){
		//check if there are at least 3 person in the game
		if (Object.keys(self.players).length >= 3 && self.gameStart == false){
			self.gameStart = true;
			self.round = 0;
			self.turnTimer = 0;
			self.gamePhase = 'DRAW';
			self.gameMessage = 'Players drawing images';
			self.chatlog.push("[GAME START]");
			for (var i in self.players){
				sockets[self.players[i].id].emit('startGame', {});
				sockets[self.players[i].id].emit('updateChat', {chatlog: self.chatlog});
			}
			//turn for order 0 player
			for (var i in self.players){
				self.players[i].cards = [];
				self.players[i].templates = [];
				self.players[i].rerolls = 3;
				self.players[i].inGame = true;
				self.players[i].getCards(sockets) //give cards to everyone in the room
			}
		}
		else if(Object.keys(self.players).length < 3 && self.gameStart == true){
			self.gameStart = false;
			self.turnTimer = 0;
			self.gameMessage = 'Waiting for players (minimum 3 required)...';
			for (var i in self.players){
				sockets[self.players[i].id].emit('disconnectEndGame', 0)
			}
		}
	}
	self.winner = function(sockets){
		for (var i in self.players){
			if (self.players[i].score >= self.maxScore){
				self.gameMessage = self.players[i].name + ' won!';
				self.gamePhase = 'WINNER';
				self.turnTimer = 30;
				for (var i in self.players){
					sockets[self.players[i].id].emit('winSound', {});
				}
			}
		}
	}
	self.newGame = function(sockets){
		self.gameStart = true;
		self.turnTimer = 0;
		self.gamePhase = 'DRAW';
		self.gameMessage = 'Players drawing images';
		self.chatlog.push("[GAME START]");
		for (var i in self.players){
			sockets[self.players[i].id].emit('startGame', {});
			sockets[self.players[i].id].emit('updateChat', {chatlog: self.chatlog});
		}
		//turn for order 0 player
		for (var i in self.players){
			self.players[i].score = 0;
			self.players[i].cards = [];
			self.players[i].templates = [];
			self.players[i].rerolls = 3;
			self.players[i].inGame = true;
		}
		for (var i in self.players){
			self.players[i].getCards(sockets) //give cards to everyone in the room
		}
	}
	self.draw = function(sockets){
		//if player has chosen a card
		for (var i in self.players){
			//change card for anyone who wants to
			if (self.players[i].chosenCard){
//				self.players[i].cards.splice(self.players[i].chosenCard, 1, Math.floor(Math.random()*imageN))
			}
			sockets[self.players[i].id].emit('updateCards', {cards: self.players[i].cards, templates: self.players[i].templates, rerolls: self.players[i].rerolls}) //send cards to everyone
		}
	}
	self.play = function(sockets){
		//get everyone's selection
		self.memes = [];
		for (var i in self.players){
			self.players[i].ready = false;
			self.memes.push({id: self.players[i].id, name: self.players[i].name, image: self.players[i].cards[self.players[i].chosenCard], template: self.players[i].templates[self.players[i].chosenTemplate], id: self.players[i].id, order: self.memes.length, votes: 0})
			self.players[i].cards.splice(self.players[i].chosenCard, 1, Math.floor(Math.random()*imageN))
			self.players[i].templates.splice(self.players[i].chosenTemplate, 1, Math.floor(Math.random()*templateN))
			if (self.players[i].inGame == true){
				sockets[self.players[i].id].emit('updateCards', {cards: self.players[i].cards, templates: self.players[i].templates, rerolls: self.players[i].rerolls}) //send cards to everyone
			}
		}
		//shuffle array
		self.memes = shuffle(self.memes);
		//send everyone the images to vote
		for (var i in self.players){
			if (self.players[i].inGame == true){
				sockets[self.players[i].id].emit('everyoneVote', self.memes);
			}
		}
	}
	self.vote = function(sockets){
		//raise score for everyone
		for (var i = 0; i < self.memes.length; i++){
			for (var j in self.players){
				if (self.players[j].vote == self.memes[i].order){
					self.memes[i].votes += 1;
					if (self.players[self.memes[i].id]) {
						self.players[self.memes[i].id].score += 1;
					}
				}
			}
		}
		for (var i in self.players){
			if (self.players[i].inGame == true){
				sockets[self.players[i].id].emit('results', self.memes);
				sockets[self.players[i].id].emit('updateScores', self.players);
			}
			if (self.players[i].inGame == false){
				self.players[i].getCards(sockets);
			}
		}
	}

	self.update = function(sockets){
		//update turntimer
		for (var i in self.players){
			sockets[self.players[i].id].emit('updateTurnTimer', {turnTimer: self.turnTimer, message: self.gameMessage, phase: self.gamePhase}) //send turn timer
		}
		if (self.gameStart){
			self.turnTimer -= 1;
			if (self.turnTimer <= 0){
				switch(self.gamePhase){
					case 'DRAW':
						self.draw(sockets);
						self.turnTimer = self.timers[1];
						self.gamePhase = 'PLAY';
						self.gameMessage = 'Make a meme! Pair an image and a template.';
						for (var i in self.players){
							sockets[self.players[i].id].emit('startGame', {});
						}
						break;
					case 'PLAY':
						self.play(sockets);
						self.turnTimer = self.timers[2] + Object.keys(self.players).length * 10;
						self.gamePhase = 'VOTE';
						self.gameMessage = 'Vote for your favorite meme!';
						break;
					case 'VOTE':
						self.vote(sockets);
						self.turnTimer = self.timers[3];
						self.gamePhase = 'RESULTS';
						self.gameMessage = 'The results are...';
						break;
					case 'RESULTS':
						self.turnTimer = self.timers[4];
						self.gamePhase = 'DRAW';
						self.gameMessage = 'Discard an image.';
						self.winner(sockets);
						break;
					case 'WINNER':
						self.newGame(sockets);
				}
			}
		}
	}
	self.updateChat = function(sockets){
		for (var i in self.players){
			sockets[self.players[i].id].emit('updateChat', {chatlog: self.chatlog});
		}
	}

	return self;
}