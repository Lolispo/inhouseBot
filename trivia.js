
var request = require('request');

function getDataQuestions(){
	request('https://opentdb.com/api.php?amount=10&category=15&difficulty=medium&type=multiple', function (error, response, body) {
		if(error !== null){
			console.log('error:', error);
		}else{
			//console.log('response:', response);
			var questions = JSON.parse(body).results;		
			//console.log('body:', questions);
			questions.forEach(function(thisQuestion){
				
				var q = thisQuestion.question;
				var ans = thisQuestion.correct_answer;
				console.log(q);
				console.log(ans);
				
				var cen_obj = getCensored(ans);
				var censored_ans = cen_obj.censored;
				var charCounter = cen_obj.charCounter;
				console.log(censored_ans);
				questions.censored_ans = censored_ans;
				questions.lessCensored = [];
				var censored_word = censored_ans;
				var revealedChars = 0;
				for(var i = 0; i < ans.length;){ // Level of censorship, should break when word is shown
					var censored_obj = getLessCensored(ans, censored_word, charCounter, i);
					censored_word = censored_obj.newCensored;
					revealedChars = censored_obj.revealedChars;
					i += revealedChars;
					questions.lessCensored[i] = censored_word; // Store in obj
					console.log(censored_word);
					if(censored_word === ans){
						console.log('We done!', revealedChars, revealedChars === ans.length);
						break;
					}
				}

			});
			return questions;
		}
	});	
}

// Different degree of censorship, lower num = more censor
// Generate numbers from 0 to charCounter, put in array
// Shuffle, for every num, reveal that index in array instead of num . array[num] instead of num
function getLessCensored(ans, cens, charCounter, num){
	var rev = 0;
	for(var i = num; i < cens.length; i++){
		if(cens.charAt(i) !== '*'){
			rev++;
		} else {
			var newCens = cens.substr(0, i) + ans.charAt(i) + cens.substr(i + 1);
			rev++;
			break;
		}
	}
	return {newCensored : newCens, revealedChars : rev}
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
