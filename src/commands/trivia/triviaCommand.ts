import { deleteDiscMessage } from "../../tools/f";
import { getDataQuestions, getGameOnGoing } from "../../trivia";


/**
 * 
 * Starts a trivia game for the people in voice channel
 * getDataQuestions options: 
 * (amount, 0, 'easy')	All categories, easy difficulty
 * (amount, 1) 	Games, all difficulties
 * (amount, 2, 'hard')  Generic knowledge questions, hard difficulty
 */
export const triviaStartCommand = (message, options) => {
  const amount = 15;
  if (!getGameOnGoing()) {
    if (options.length >= 2) {
      // Grabs second argument if available
      let category = 0;
      let difficulty = '';
      switch (options[1]) {
        case 'allsubjectseasy':
          difficulty = 'easy';
          break;
        case 'all':
        case 'allquestions':
        case 'anything':
          break;
        case 'game':
        case 'games':
        case 'gamesall':
          category = 1;
          break;
        case 'gameseasy':
        case 'gameeasy':
          category = 1;
          difficulty = 'easy';
          break;
        case 'gamesmedium':
          category = 1;
          difficulty = 'medium';
          break;
        case 'gameshard':
          category = 1;
          difficulty = 'hard';
          break;
        case 'generic':
        case 'genericeasy':
          category = 2;
          difficulty = 'easy';
          break;
        case 'genericall':
          category = 2;
          break;
        default: // Check for all modes
          const categoryNum = parseInt(options[1]);
          if (!isNaN(categoryNum) && categoryNum >= 9 && categoryNum <= 32) {
            category = categoryNum;
            if (options.length >= 3) {
              if (options[2] === 'easy' || options[2] === 'medium' || options[2] === 'hard') {
                difficulty = options[2];
              }
            }
          } else {
            difficulty = 'easy';
          }
      }
      console.log(`Modes: category = ${category}, difficulty = ${difficulty}`);
      getDataQuestions(message, amount, category, difficulty);
    } else { // No mode chosen, use default
      console.log(`No mode chosen, use default (mode.length = ${options.length})`);
      getDataQuestions(message, amount); // allsubjectseasy
    }
  } else { // Game currently on, don't start another one
    console.log(`Duplicate Trivia starts, ignoring ${message.content} ...`);
  }
  deleteDiscMessage(message, 15000, 'trivia');
};
