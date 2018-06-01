
var request = require('request');

function getDataQuestions(){
	request('https://opentdb.com/api.php?amount=10&category=15&difficulty=medium&type=multiple', function (error, response, body) {
		if(error !== null){
			console.log('error:', error);
		}else{
			//console.log('response:', response);
			var questions = JSON.parse(body).results;		
			console.log('body:', questions);
			questions.forEach(function(thisQuestion){
				
				var q = thisQuestion.question;
				var ans = thisQuestion.correct_answer;
				console.log(q);
				console.log(ans);
				
				var cen_obj = getCensored();
				var censored_ans = cen_obj.censored;
				var charCounter = cen_obj.charCounter;
				console.log(censored_ans);
				questions.censored_ans = censored_ans;
				questions.lessCensored = [];
				var revealedChars = 0;
				for(var i = 0; i < 5; i++){ // Level of censorship, should break when word is shown
					var censored_obj = getLessCensored(ans, censored_ans, charCounter, i, revealedChars);
					var censored_word = censored_obj.newCensored;
					revealedChars = censored_obj.revealedChars;
					questions.lessCensored[i] = censored_word; // Store in obj
					if(censored_word === ans){
						break;
					}
				}

			});
			return questions;
		}
	});	
}

// Different degree of censorship, lower num = more censor
function getLessCensored(ans, cens, charCounter, num, rev){
	var length = cens.length;
	return {newCensored : censored, revealedChars : rev}
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
	return {censored : s, charCounter : charCounter};
}

getDataQuestions();
