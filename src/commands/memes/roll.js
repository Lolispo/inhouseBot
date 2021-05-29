

exports.rollAction = (message, options) => {
  console.log('RollCommand');
  if(options.length === 2 && !isNaN(parseInt(options[1]))){ // Valid input
    roll(message, 0, options[1])
  }else if(options.length === 3 && !isNaN(parseInt(options[1])) && !isNaN(parseInt(options[2]))){ // Valid input
    roll(message, parseInt(options[1]), parseInt(options[2]))
  }else {
    roll(message, 0, 100);
  }
}

// Roll functionality
function roll(message, start, end){
	var roll = Math.floor((Math.random() * (end-start))) + start;
	if(end === roll && (end-start) > 50){ // Only saves message if diff at least 50
		f.print(message, '**' + message.author.username + ' rolled a ' + roll + ' (' + start + ' - ' + end + ')**', noop);
	}else{
		if(roll > (start + (end-start)/ 2)){ // Majority roll gets bold
			f.print(message, message.author.username + ' rolled a **' + roll + '** (' + start + ' - ' + end + ')');
		} else{
			f.print(message, message.author.username + ' rolled a ' + roll + ' (' + start + ' - ' + end + ')');
		}
	}
	f.deleteDiscMessage(message, 10000, 'roll');
}
