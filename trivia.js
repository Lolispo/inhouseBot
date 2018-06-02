'use strict';
// Author: Petter Andersson
var request = require('request');

const f = require('./f');
const player_js = require('./player');
var token = '';
var done = false;
var ans = '';
var activePlayers = [];
var pointMap = {};
var questionsArray = [];
var questionIndex;
var messageVar = {}; // Initialize somewhere on a message in chat
var censoredMessage;
var shuffledMessage;
var allMessages = [];

const channelName = 'trivia-channel';
const waitTimeForSteps = 10;
const lengthForShuffle = 8;
const maxPossiblePoints = 5;

// Checks logic for message, matches with current answer
exports.isCorrect = function(message){
	if(message.content.toLowerCase() === ans.toLowerCase()){
		done = true;
		var pointsToIncrease = pointMap.get(message.author.id);
		var player = player_js.getPlayer(activePlayers, message.author.id);
		var newMmr = pointsToIncrease; // TODO: Temp, implement when player.js is updated and DB is updated
		// var newMmr = player.trivia + pointsToIncrease;
		// db_sequelize.updateMmr(message.author.id, newMmr, trivia);
		finishedQuestionDelete();
		// Decide if messages should be removed differently
		f.print(message, message.author.username + ' answered correctly! Answer was: ' + ans + '. Trivia Rating: ' + newMmr + ' (+' + pointsToIncrease + ')'); 
		pointMap.forEach(function(value, key) {
			pointMap.set(key, maxPossiblePoints);
		});
		questionIndex++;
		startQuestion();
	} else{
		// Decrease personal possible points for player, down to 1 point
		var currentPoints = pointMap.get(message.author.id);
		pointMap.set(message.author.id, ((currentPoints - 1) < 1 ? 1 : (currentPoints - 1))); 
	}
}

// Starts game, requires messageVar (from correct textchannel) and questions
exports.startGame = function(message, questions, players){
	activePlayers = players;
	pointMap = new Map();
	for(var i = 0; i < activePlayers.size(); i++){
		pointMap.set(activePlayers[i].uid, maxPossiblePoints);
	}
	// Find text channel: Send start message
	var channel = message.guild.channels.find('name', channelName);
	channel.send('Starting game of trivia!')
	.then(result => {
		messageVar = result;		// Initialize messageVar to be in correct chhanel, used for print
		deleteDiscMessage(result);	// Delete start message after default time
	}).catch(err => console.log('@startGame: ' + err));
	questionsArray = questions;
	questionIndex = 0
	startQuestion();
}

// Start a new question, when previous is finished
function startQuestion(){
	if(questionIndex > questionsArray.size()){
		f.print(messageVar, 'Game Ended. Results: \n' + player_js.getSortedRating(activePlayers, 'trivia'))
	} else{
		var q = questionsArray[questionIndex]; // TODO See if / how it should work
		/*
		console.log('Question: ' + thisQuestion.question);
		console.log('Ans:', thisQuestion.correct_answer);
		console.log('Shuffled ans:', thisQuestion.shuffledAns);
		console.log('Finished Censored:' + '\n', thisQuestion.lessCensored);
		*/
		done = false;
		f.print(message, q.question)
		ans = thisQuestion.correct_answer;
		if(ans.length >= lengthForShuffle){
			setTimeout(function(){
				if(!done){
					f.print(message, q.shuffledAns, function(msg){
						shuffledMessage = msg;
					});
					nextLessCensored(q.lessCensored, 0, message);		
				}	
			}, waitTimeForSteps);
		} else {
			nextLessCensored(q.lessCensored, 0, message);
		}
	}
}

// Print next clue after next interval
function nextLessCensored(array, index, message){
	setTimeout(function(){
		if(!done){
			if(index === 0){
				f.print(message, array[index], function(msg){
					censoredMessage = msg;
					nextLessCensored(array, index + 1, msg);		
				});
			} else{
				censoredMessage.edit(array[index]);
			}
		}
	}, waitTimeForSteps);
}

// TODO: Add more options for different questions, generic might be better, more categories
// https://opentdb.com/api_config.php
exports.getDataQuestions = function(amount = 10, category = 1, difficulty = 0){
	var categories = '&category=';
	if(category === 0){
		categories = '';
	} else if(category === 1){ // Games
		categories += '15'; 
	} else if(category === 2){ // Generic Knowledge
		categories += '9';
	} // TODO Add custom choice of category
	var difficulties = '&difficulty=';
	if(difficulty === 0){
		difficulties = '';
	} else if(difficulty === 1){ // Easy
		difficulties += 'easy';
	} else if(difficulty === 2){ // Medium
		difficulties += 'medium';
	} else if(difficulty === 3){ // Hard
		difficulties += 'hard';
	}
	if(token === ''){
		getToken(amount, categories, difficulties);
	} else {
		urlGenerate(amount, categories, difficulties, token);	
	}
}

function urlGenerate(a, c, d, t){
	var url = 'https://opentdb.com/api.php?amount=' + a + c + d +'&type=multiple'
	if(!f.isUndefined(t)){
		url += '&token='+t; 
	} else{
		console.log('UNDEFINED TOKEN, continues without token');
	}
	console.log(url);
	request(url, function (error, response, body) {
		if(error !== null){
			console.log('error:', error);
		}else{
			body = JSON.parse(body);
			if(body.response_code === 3 || body.response_code === 4){ // Token not found
				getToken(a, c, d);
			} else if(body.response_code === 0){
				//console.log('response:', response);
				//console.log('body:', body);
				console.log('Valid Token: Success!');
				return handleQuestions(body.results);				
			} else { // 1 and 2, NO results, (too many questions) and invalid parameters
				console.log('DEBUG:', body.response_code); // Might be due to too many questions
			}
		}
	});	
}

// Get token
function getToken(a, c, d){
	request('https://opentdb.com/api_token.php?command=request', function (error, response, body) {
		//console.log('body:', body);
		body = JSON.parse(body);
		console.log('@getToken', body.token);
		urlGenerate(a, c, d, body.token);
	});
}

function handleQuestions(questions){		
	questions.forEach(function(thisQuestion){
		
		var q = thisQuestion.question;
		var ans = thisQuestion.correct_answer;
		//console.log(q);
		//console.log(ans);
		
		var cen_obj = getCensored(ans);
		var censored_ans = cen_obj.censored;
		var charCounter = cen_obj.charCounter;
		//console.log(censored_ans);
		var indexes = [];
		for(var i = 0; i < ans.length; i++){
			indexes.push(i);
		}
		indexes = shuffle(indexes);
		//console.log('indexes =', indexes)
		thisQuestion.censored_ans = censored_ans;
		thisQuestion.lessCensored = [];
		var censored_word = censored_ans;
		var revealedChars = 0;
		var charIndex = 0;
		var index = 0;
		//console.log('DEBUG: ans, charcounter, indexes.length, ', ans.length, charCounter, indexes.length);
		while(charIndex < charCounter){ // Level of censorship, should break when word is shown
			for(var j = index; j < censored_word.length; j++){
				var c = censored_word.charAt(indexes[j]);
				if(c !== '*'){
					//console.log(censored_word, charIndex, index, j, indexes[j], 'invalid char "' + c + '"', );
					index++;
				} else {
					var newCens = censored_word.substr(0, indexes[j]) + ans.charAt(indexes[j]) + censored_word.substr(indexes[j] + 1);
					thisQuestion.lessCensored[charIndex] = censored_word; // Store in obj
					charIndex++;
					index++;
					break;
				}
			}
			censored_word = newCens;
			//console.log(censored_word, charIndex, index);
			if(censored_word === ans){
				//console.log('We done!', censored_word);
				break;
			}
		}
		var charArray = Array.from(thisQuestion.correct_answer).filter(word => word !== ' ');
		thisQuestion.shuffledAns = shuffle(charArray).join('').toLowerCase(); // lower case

		console.log('Question: ' + thisQuestion.question);
		console.log('Ans:', thisQuestion.correct_answer);
		console.log('Shuffled ans:', thisQuestion.shuffledAns);
		console.log('Finished Censored:' + '\n', thisQuestion.lessCensored);
	});
	return questions;
}

// Shuffle array
function shuffle(array){
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

function getCensored(ans){
	var s = '';
	var charCounter = 0;
	for(var i = 0; i < ans.length; i++){
		var c = ans.charAt(i);
		if(c === ' '){
			s += ' ';
		} else if(c === '"'){
			s += '"';
		} else{
			s += '*';
			charCounter++;
		}
	}
	//console.log('DEBUG @charCounter', ans, ans.length, charCounter);
	return {censored : s, charCounter : charCounter};
}

function finishedQuestionDelete(){
	if(!f.isUndefined(shuffledMessage)){
		f.deleteDiscMessage(shuffledMessage, 0, 'shuffledMessage');	
	}
	if(!f.isUndefined(censoredMessage)){
		f.deleteDiscMessage(censoredMessage, 0, 'censoredMessage');	
	}
}

exports.getChannelName = function(){
	return channelName;
}