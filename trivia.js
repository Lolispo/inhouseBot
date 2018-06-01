'use strict';
// Author: Petter Andersson

var request = require('request');

// TODO: Add more options for different questions, generic might be better, more categories
// TODO: Token for different questions? https://opentdb.com/api_config.php
function getDataQuestions(amount){
	request('https://opentdb.com/api.php?amount=' + amount + '&category=15&difficulty=medium&type=multiple', function (error, response, body) {
		if(error !== null){
			console.log('error:', error);
		}else{
			//console.log('response:', response);
			//console.log('body:', questions);
			return handleQuestions(JSON.parse(body).results);
		}
	});	
}

function handleQuestions(){
	var questions = ;		
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

getDataQuestions(10); // Test code
