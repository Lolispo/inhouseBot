
// Author: Petter Andersson
// Used to fix html chars

/*
	Handles a trivia gamemode
	Uses player and db_sequelize to update rating
*/

import * as f from './tools/f';

const Entities = require('html-entities').XmlEntities;
import request from 'request';

const entities = new Entities();

import { getPlayer, createPlayer, getSortedRatingTrivia, Player } from './game/player';
import { triviaStart } from './bot';
import { initializePlayers, updateDbMMR } from './database/db_sequelize';
import { getPrefix } from './tools/load-environment';
import { getAdminUids } from './BaseCommandTypes';

let gameOnGoing = false;
let author;
let ans = '';
let activePlayers = [];
let questionsArray = [];
let questionIndex;
let lastQuestionIndex;
let pointMap;
let done;		// Array over if questions are done or not
let messageVar; // Initialize somewhere on a message in chat
let activeQuestion = false;
let questionMessage;
let censoredMessage;
let shuffledMessage;
let finishMessage;
const allMessages = [];
let lock = false;

const channelName = 'trivia-channel';
const token_fileName = 'trivia.token'; // TODO: Change to ../tmp/trivia.token (process.cwd())
const waitTimeForSteps = 8000;
const lengthForShuffle = 8;
const lengthForEvenFaster = 16;
const maxPossiblePoints = 5;
const maxAllowedAnswerLength = 30;
const waitTimeStartQuestion = 3000;
const invalidInput = '<INVALID INPUT>';
const exitCommands = ['exit', 'exitgame', 'exittrivia', 'quit', 'quitTrivia'];
const trivia_gamemodes = new Map([
  [0, 'All subjects'],
  [1, 'Games'],
  [2, 'General Knowledge'],
  [9, 'General Knowledge'],
  [10, 'Entertainment: Books'],
  [11, 'Entertainment: Film'],
  [12, 'Entertainment: Music'],
  [13, 'Entertainment: Musicals & Theatres'],
  [14, 'Entertainment: Television'],
  [15, 'Entertainment: Video Games'],
  [16, 'Entertainment: Board Games'],
  [17, 'Science & Nature'],
  [18, 'Science: Computers'],
  [19, 'Science: Mathematics'],
  [20, 'Mythology'],
  [21, 'Sports'],
  [22, 'Geography'],
  [23, 'History'],
  [24, 'Politics'],
  [25, 'Art'],
  [26, 'Celebrities'],
  [27, 'Animals'],
  [28, 'Vehicles'],
  [29, 'Entertainment: Comics'],
  [30, 'Science: Gadgets'],
  [31, 'Entertainment: Japanese Anime & Manga'],
  [32, 'Entertainment: Cartoons & Animations'],
]);

// Valid user doing the command
function isAuthorized(message) {
  return author === message.author || getAdminUids().includes(message.author.id);
}

// Valid command, either matches a exitcommand or is a exitcommand with prefix before
function isExitCommand(message) {
  return (exitCommands.includes(message.content.toLowerCase())
		|| (
		  exitCommands.includes(message.content.toLowerCase().slice(getPrefix().length))
			&& (getPrefix() === message.content.toLowerCase().slice(0, getPrefix().length))
		)
  );
}

// Checks logic for message, matches with current answer
export const isCorrect = function (message) {
  if (isAuthorized(message) && isExitCommand(message)) {
    // Makes this the final question
    f.print(message, 'Exit command used. This is the final question!');
    lastQuestionIndex = questionIndex;
  }
  if (message.content.toLowerCase() === ans.toLowerCase() && message.content.toLowerCase() !== invalidInput && !lock) {
    lock = true;
    const player = getPlayer(activePlayers, message.author.id);
    if (f.isUndefined(player)) {
      const tempPlayer = createPlayer(message.author.username, message.author.id);
      const tempPlayers = [tempPlayer];
      activePlayers.push(tempPlayer);
      initializePlayers(tempPlayers, 'trivia', (playerList) => {
        updateTriviaMMR(message, playerList[0]); // Only one player used here, since this user wasn't initialized
      });
    } else {
      updateTriviaMMR(message, player);
    }
  } else {
    // Decrease personal possible points for player, down to 1 point
    const currentPoints = pointMap.get(message.author.id);
    pointMap.set(message.author.id, ((currentPoints - 1) < 1 ? 1 : (currentPoints - 1)));
  }
  // TODO: Make sure all user entried questioned are pushed
  allMessages.push(message);
};

function updateTriviaMMR(message, player) {
  let pointsToIncrease = pointMap.get(message.author.id);
  if (f.isUndefined(pointsToIncrease)) {
    pointsToIncrease = maxPossiblePoints;
  }
  pointMap.set(message.author.id, pointsToIncrease);
  const newMmr = player.getMMR('trivia') + pointsToIncrease;
  // Update mmr
  player.setMMR('trivia', newMmr);
  const newMmrSession = player.getMMR('trivia_temp') + pointsToIncrease;
  player.setMMR('trivia_temp', newMmrSession);
  updateDbMMR(message.author.id, newMmr, 'trivia');
  const answer_correct = `${message.author.username} answered correctly! Answer was: **${ans}**. Trivia Rating: ${newMmrSession
  } (+${pointsToIncrease}, Total: ${newMmr})`;
  if (isNaN(player.getMMR('trivia'))) {
    // Debug print: Check player if mmr is NaN
    console.log('DEBUG @updateTriviaMMR', player.getMMR('trivia_temp'), answer_correct);
  }
  if (!f.isUndefined(finishMessage)) {
    f.deleteDiscMessage(finishMessage, 0, 'finishMessage', (msg) => { // Msg = deleted message reference
      callbackFinishMessage(message, answer_correct);
    });
  } else {
    callbackFinishMessage(message, answer_correct);
  }
}

function callbackFinishMessage(message, messageString) {
  console.log(`DEBUG @callbackFinishMessage ${messageString}`);
  f.print(message, messageString, (msg) => {
    finishMessage = msg;
    finishedQuestion();
    startQuestion();
  });
}

// Starts game, requires messageconst (from correct textchannel) and questions
export const startGame = function (message, questions, players: Player[]) {
  gameOnGoing = true;
  activePlayers = players;
  pointMap = new Map();
  for (let i = 0; i < activePlayers.length; i++) {
    pointMap.set(activePlayers[i].uid, maxPossiblePoints);
  }
  done = [];
  for (let i = 0; i < questions.length; i++) {
    done.push(false);
  }
  questionsArray = questions;
  lastQuestionIndex = questionsArray.length;
  questionIndex = 0;
  // Find text channel: Send start message
  // TODO: V.12 is causing issue here
  const channel = message.guild.channels.cache.find('name', channelName);
  channel.send('Starting game of trivia!')
    .then((result) => {
      messageVar = result;			// Initialize messageconst to be in correct chanel, used for print
      f.deleteDiscMessage(result);	// Delete start message after default time
      startQuestion();
    }).catch(err => console.log(`@startGame: ${err}`));
};

// Start a new question, when previous is finished
function startQuestion() {
  // **Question: **In "Fallout 4" which faction is not present in the game?, crashes. Get answer undefined
  // SpongeBob SquarePants, couldnt find answer, look at caps
  // What is not a wind instrument?
  // In which series of games do you collect souls to empower you and buy weaponry and armor with? 	Souls
  // **Where is the train station "Llanfair&shy;pwllgwyngyll&shy;gogery&shy;chwyrn&shy;drobwll&shy;llan&shy;tysilio&shy;gogo&shy;goch"?
  if (questionIndex >= lastQuestionIndex) {
    setTimeout(() => {
      if (!f.isUndefined(finishMessage)) {
        f.deleteDiscMessage(finishMessage, f.getDefaultRemoveTime(), 'finishMessage');
      }
      let resultString = '';
      if (activePlayers.length > 0) {
        resultString = `Results: \n${getSortedRatingTrivia(activePlayers)}`;
      }
      f.print(messageVar, `Game Ended. ${resultString}`);
      gameOnGoing = false;
    }, waitTimeStartQuestion);
  } else if (!activeQuestion) {
    activeQuestion = true;
    ans = invalidInput;
    setTimeout(() => {
      console.log(`Starting new Question[${questionIndex}], done = ${done[questionIndex]}`);
      lock = false;
      let q = questionsArray[questionIndex];
      for (let i = questionIndex; i < lastQuestionIndex; i++) {
        if (!q.used) {
          questionIndex++;
          q = questionsArray[questionIndex];
        } else {
          break;
        }
      }
      done[questionIndex] = false;
      f.print(messageVar, `**Question: **${parseMessage(q.question)}`, (msg) => {
        questionMessage = msg;
      }); // TODO: Add callback, save question and remove in finishQuestion()
      ans = parseMessage(q.correct_answer);
      if (ans.length >= lengthForShuffle) {
        setTimeout(() => {
          if (!done[questionIndex]) {
            f.print(messageVar, `\`${q.shuffledAns}\``, (msg) => {
              shuffledMessage = msg;
            });
            let waitTime = waitTimeForSteps;
            if (ans.length >= lengthForEvenFaster) {
              waitTime /= 3;
            } else {
              waitTime /= 2;
            }
            nextLessCensored(q.lessCensored, 0, messageVar, questionIndex, waitTime);
          }
        }, waitTimeForSteps / 2);
      } else {
        nextLessCensored(q.lessCensored, 0, messageVar, questionIndex, waitTimeForSteps);
      }
    }, waitTimeStartQuestion);
  }
}

// Print next clue after next interval
function nextLessCensored(array, index, message, qIndex, waitTime) {
  setTimeout(() => {
    if (!done[qIndex]) {
      if (index === 0) {
        f.print(message, `\`${array[index]}\``, (msg) => { // array[index] = undefined, crash bot
          censoredMessage = msg;
          nextLessCensored(array, index + 1, msg, qIndex, waitTime);
        });
      } else if (index === array.length) { // Out of hints, Fail -> next question
        if (!lock) {
          const noone_answered = `Noone answered in time! Answer was: **${ans}**`;
          if (!f.isUndefined(finishMessage)) {
            f.deleteDiscMessage(finishMessage, 0, 'finishMessage', (msg) => {
              callbackFinishMessage(message, noone_answered);
            });
          } else {
            callbackFinishMessage(message, noone_answered);
          }
        }
      } else {
        censoredMessage.edit(`\`${array[index]}\``)
          .then((msg) => {
            nextLessCensored(array, index + 1, msg, qIndex, waitTime);
          });
      }
    }
  }, waitTime);
}

// Start getting questions from db
// https://opentdb.com/api_config.php
export const getDataQuestions = async (message, amount = 15, category = 0, difficulty = 'easy') => {
  console.log('@getDataQuestions', amount, category, difficulty);
  f.print(message, `Trivia Mode: ${trivia_gamemodes.get(category)}, difficulty: ${!difficulty ? 'all' : difficulty}`);
  author = message.author;
  messageVar = message;
  let categories = '&category=';
  if (category === 0) {
    categories = '';
  } else if (category === 1) { // Games
    categories += '15';
  } else if (category === 2) { // Generic Knowledge
    categories += '9';
  } else if (category >= 9 && category <= 32) {
    categories += category;
  }
  let difficulties = '&difficulty=';
  if (!difficulty) {
    difficulties = '';
  } else {
    difficulties += difficulty;
  }
  try {
    const tokenVar = await f.readFromFile(token_fileName, 'Token Trivia: ');
    console.log('@getDataQuestions Read Token: ', tokenVar);
    urlGenerate(amount, categories, difficulties, tokenVar);
  } catch (err) {
    console.log('@getDataQuestions fileRead failed - Getting new token');
    getToken(amount, categories, difficulties);
  };
};

function urlGenerate(a, c, d, t?) {
  console.log('@urlGenerate');
  let url = `https://opentdb.com/api.php?amount=${a}${c}${d}&type=multiple`;
  if (!f.isUndefined(t)) {
    url += `&token=${t}`;
  } else {
    console.log('UNDEFINED TOKEN, continues without token');
  }
  console.log(`URL = ${url}`);
  request(url, (error, response, body) => {
    if (error !== null) {
      console.log('error:', error);
    } else {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('API down', e);
        return;
      }
      if (body.response_code === 3 || body.response_code === 4) { // Token not found
        console.log('DEBUG: response_code =', body.response_code);
        if (f.isUndefined(t) || body.response_code === 3) { // Either we dont have a token, tried to send something invalid, or old token
          getToken(a, c, d);
        } else if (body.response_code === 4) { // Probably too many questions requested, request without token to get code === 1
          urlGenerate(a, c, d);
        }
      } else if (body.response_code === 0) {
        // console.log('response:', response);
        // console.log('body:', body);
        console.log('Success! Got questions');
        handleQuestions(body.results, (questions, message) => {
          triviaStart(questions, message, author);
        });
      } else if (body.response_code === 1) { // Not Enough questions
        if (Math.round(a / 2) === 1) {
          f.print(messageVar, 'Not enough questions for this mode');
        } else {
          urlGenerate(Math.round(a / 2), c, d, t);
        }
      } else if (body.response_code === 2) { // Invalid parameters
        console.log('DEBUG: Check me', body.response_code);
      }
    }
  });
}

// Get new token
function getToken(a, c, d) {
  console.log('@getToken');
  request('https://opentdb.com/api_token.php?command=request', (error, response, body) => {
    // console.log('body:', body);
    if (error) {
      console.error('API token error');
      return;
    }
    try {
      body = JSON.parse(body);
    } catch (e) {
      return;
    }
    console.log('@getToken request new', body.token);
    f.writeToFile(token_fileName, body.token, 'Success! Wrote token to file for trivia');
    urlGenerate(a, c, d, body.token);
  });
}

function parseMessage(msg) {
  // console.log('Parsing Ans: ' + msg);
  // &Ouml; = ö, not handled by entities?
  msg = entities.decode(msg);
  msg = msg.replace(/&shy;/g, ''); // '-\n' for linebreak (used to allow line breaks with - for big words)
  msg = msg.replace(/&prime;/g, "'");
  msg = msg.replace(/&Prime;/g, '"');
  return msg;
}

function handleQuestions(questions, callback) {
  questions.forEach((thisQuestion) => {
    const ans = parseMessage(thisQuestion.correct_answer);
    // console.log(ans);

    const cen_obj = getCensored(ans);
    const censored_ans = cen_obj.censored;
    const { charCounter } = cen_obj;
    let indexes = [];
    const current_question = thisQuestion.question.toLowerCase();
    if (current_question.includes('following') || current_question.includes('which of these') || current_question.includes('which one of these')
				|| current_question.includes('who out of these')) {
      // Filter out bad questions for this format
      console.log(`Skipping a question, Question: ${parseMessage(thisQuestion.question)}`);
      thisQuestion.used = false;
      return;
    }
    if (ans.length > maxAllowedAnswerLength) {
      console.log(`Skipping a question, Answer: ${ans}`);
      thisQuestion.used = false;
      return; // Should continue with next iteration since forEach
    }
    thisQuestion.used = true;
    // TODO: Dont allow questions containing 'not', usually not fit for the game, or 'following' and 'not'
    for (let i = 0; i < ans.length; i++) {
      indexes.push(i);
    }
    indexes = f.shuffle(indexes);
    // console.log('indexes =', indexes)
    thisQuestion.censored_ans = censored_ans;
    thisQuestion.lessCensored = [];
    let censored_word = censored_ans;
    let charIndex = 0;
    let index = 0;
    // console.log('DEBUG: ans, charcounter, indexes.length, ', ans.length, charCounter, indexes.length);
    while (charIndex < charCounter) { // Level of censorship, should break when word is shown
			let newCens;
      for (let j = index; j < censored_word.length; j++) {
        const c = censored_word.charAt(indexes[j]);
        if (c !== '*') {
          // console.log(censored_word, charIndex, index, j, indexes[j], 'invalid char "' + c + '"', );
          index++;
        } else {
          newCens = censored_word.substr(0, indexes[j]) + ans.charAt(indexes[j]) + censored_word.substr(indexes[j] + 1);
          thisQuestion.lessCensored[charIndex] = censored_word; // Store in obj
          charIndex++;
          index++;
          break;
        }
      }
      censored_word = newCens; // TODO: Check what is expected here - had broken code
      // console.log(censored_word, charIndex, index);
      if (censored_word === ans) {
        // console.log('We done!', censored_word);
        break;
      }
    }
    const charArray = Array.from(ans).filter(word => word !== ' ');
    thisQuestion.shuffledAns = f.shuffle(charArray).join('').toLowerCase(); // lower case
    /*
		console.log('Question: ' + thisQuestion.question);
		console.log('Ans:', thisQuestion.correct_answer);
		console.log('Shuffled ans:', thisQuestion.shuffledAns);
		console.log('Finished Censored:' + '\n', thisQuestion.lessCensored);
		*/
  });
  callback(questions, messageVar);
}

function getCensored(ans) {
  let s = '';
  let charCounter = 0;
  for (let i = 0; i < ans.length; i++) {
    const c = ans.charAt(i);
    if (c === ' ') {
      s += ' ';
    } else if (c === '"') {
      s += '"';
    } else {
      s += '*';
      charCounter++;
    }
  }
  // console.log('DEBUG @charCounter', ans, ans.length, charCounter);
  return { censored: s, charCounter };
}

// Used inbetween question to reset pointMap, increase question index and show to timeouts that we are done
function finishedQuestion() {
  activeQuestion = false;
  done[questionIndex] = true;
  if (!f.isUndefined(shuffledMessage)) {
    f.deleteDiscMessage(shuffledMessage, 0, 'shuffledMessage');
  }
  if (!f.isUndefined(censoredMessage)) {
    f.deleteDiscMessage(censoredMessage, 0, 'censoredMessage');
  }
  if (!f.isUndefined(questionMessage)) {
    f.deleteDiscMessage(questionMessage, 0, 'questionMessage');
  }
  if (!f.isUndefined(allMessages)) {
    for (let i = allMessages.length - 1; i >= 0; i--) {
      f.deleteDiscMessage(allMessages[i], 0, `allMessages[${i}]`, (msg) => {
        const index = allMessages.indexOf(msg);
        if (index > -1) {
          allMessages.splice(index, 1);
        }
      });
    }
  }
  pointMap.forEach((value, key) => {
    pointMap.set(key, maxPossiblePoints);
  });
  questionIndex++;
}

export const getChannelName = function () {
  return channelName;
};

export const getGameOnGoing = function () {
  return gameOnGoing;
};
