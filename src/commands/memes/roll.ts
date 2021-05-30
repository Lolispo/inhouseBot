import { noop } from '../../client';
import { print, deleteDiscMessage } from '../../tools/f';
import { getConfig } from '../../tools/load-environment';

const { prefix } = getConfig();
export const rollCommands = [prefix + 'roll'];

export const rollAction = (message, options) => {
  console.log('RollCommand');
  if (options.length === 2 && !isNaN(parseInt(options[1]))) { // Valid input
    roll(message, 0, options[1]);
  } else if (options.length === 3 && !isNaN(parseInt(options[1])) && !isNaN(parseInt(options[2]))) { // Valid input
    roll(message, parseInt(options[1]), parseInt(options[2]));
  } else {
    roll(message, 0, 100);
  }
};

// Roll functionality
function roll(message, start, end) {
  const roll = Math.floor((Math.random() * (end - start))) + start;
  if (end === roll && (end - start) > 50) { // Only saves message if diff at least 50
    print(message, `**${message.author.username} rolled a ${roll} (${start} - ${end})**`, noop);
  } else if (roll > (start + (end - start) / 2)) { // Majority roll gets bold
    print(message, `${message.author.username} rolled a **${roll}** (${start} - ${end})`);
  } else {
    print(message, `${message.author.username} rolled a ${roll} (${start} - ${end})`);
  }
  deleteDiscMessage(message, 10000, 'roll');
}
