const triviaStartCommand = (message, options) => {
  var amount = 15;
  if(!trivia.getGameOnGoing()){
    if(options.length >= 2){
      // Grabs second argument if available
      var category = 0;
      var difficulty = 0;
      switch(options[1]){
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
          var categoryNum = parseInt(options[1]);
          if(!isNaN(categoryNum) && categoryNum >= 9 && categoryNum <= 32){
            category = categoryNum;
            if(options.length >= 3){
              if(options[2] === 'easy' || options[2] === 'medium' || options[2] === 'hard'){
                difficulty = options[2];
              }
            }
          } else {
            difficulty = 'easy';			
          }
      }
      console.log('Modes: category = ' + category + ', difficulty = ' + difficulty);
      trivia.getDataQuestions(message, amount, category, difficulty);
    } else{ // No mode chosen, use default
      console.log('No mode chosen, use default (mode.length = ' + options.length + ')');
      trivia.getDataQuestions(message, amount); // allsubjectseasy
    }
  } else { // Game currently on, don't start another one
    console.log('Duplicate Trivia starts, ignoring ' + message.content + ' ...');
  }
  f.deleteDiscMessage(message, 15000, 'trivia');
}