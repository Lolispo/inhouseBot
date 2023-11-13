
// Author: Petter Andersson

// Should handle general help functions
import { EmbedBuilder, Message } from 'discord.js';
import { promises as fs } from 'fs';
import { IEmbeddedMessageInput } from '../types';

export const getDefaultRemoveTime = () => 60000;

/*
const nodeCleanup = require('node-cleanup');
// TODO Cleanup on exit, can't control SIGINT (ctrl+c) Correctly, requires synchronous code
nodeCleanup(function (exitCode, signal) {
    // release resources here before node exits
    onExitDelete();
});
*/

// Returns boolean over if type of obj is undefined
// Could add function isNotUndefined for readability, replace !isUndefined with isNotUndefined
export const isUndefined = function (obj) {
  return (typeof obj === 'undefined');
};

export const prettifyPercentage = (value) => Math.floor((Number(value.toFixed(2)) * 100));

export const padString = (value, expectedMaxLength = '100%'.length) => {
  return value + ' '.repeat(expectedMaxLength - String(value).length);
}

/**
 * Used to print message in channel, use for every use of channel.send for consistency
 * Returns promise for use in async functions
 */
export const print = (messageVar: Message, message: string | IEmbeddedMessageInput, callback = callbackPrintDefault) => {
  let printableCommand = message;
  if ((message as IEmbeddedMessageInput).embeds) { // Embedded Message
    const embeddedMessage = message as IEmbeddedMessageInput;
    const embeds = embeddedMessage.embeds;
    embeds.forEach((embed: EmbedBuilder) => {
      printableCommand = `(Embed)${embed.data}`;
      messageVar.channel.send(message)
        .then((result) => {
          callback(result);
        })
        .catch(err => console.log(`@error on send for ${message} :\n${err}`));
    });
  }
  console.log(`> ${printableCommand}`);

  // Handle for string messages
  if (typeof message === 'string') {
    const messages = groupMessageOnSize(message);

    // Send first message
    if (messages.length >= 1) {      
      const firstMessage = messages[0];
      messageVar.channel.send(firstMessage)
        .then((result) => {
          callback(result);
        })
        .catch(err => console.log(`@error on send for ${message}:\n${err}`));
    }

    // Recursively send restMessage
    if (messages.length > 1) {
      const restMessage = messages[1];
      print(messageVar, restMessage, callback);
    }
  }
};

export const editMessage = (messageVar: Message, newMessageContent: string, callback = callbackPrintDefault) => {
  messageVar.edit(newMessageContent)
    .then((result) => {
      callback(result);
    })
    .catch(err => console.log(`@error on edit message for ${newMessageContent} :\n${err}`));
}

/**
 * Discord has a limit of 2000 character per sent message
 * @param message is the message that is requested to be sent in one message
 * If it smaller than 2000, its returned directly [message]
 * Otherwise, split on \n and try again
 * If no \n are found, split on allowed maxIndex
 * @returns array [firstMesage, restMessage]
 */
export const groupMessageOnSize = (message: string): string[] => {
  // Handle big messages
  const maxSizeForMessage = 2000;
  const maxIndex = 1900;
  if (message.length >= maxSizeForMessage) {
    // Check if styling is contained within ```
    const isStyledMessage = message.indexOf('```') !== -1;
    // Try to split the message on \n and send messages until new lines until the rest 
    // Can be fitted into one message
    for (let i = maxSizeForMessage; i >= 0; i--) {
      if (message.charAt(i) === '\n') {
        const firstMessage = message.substring(0, i) + (isStyledMessage ? '```' : '');
        const restMessage = (isStyledMessage ? '```' : '') + message.substring(i);
        return [firstMessage, restMessage];
      }
    }

    // No newline in message, split content on max size
    const firstMessage = message.substring(0, maxIndex) + (isStyledMessage ? '```' : '');
    const restMessage = (isStyledMessage ? '```' : '') + message.substring(maxIndex);
    return [firstMessage, restMessage];
  }
  return [message];
}

const listToDeleteFrom = new Map();
const deleteIntervals = [];

export const deleteDiscMessage = (messageVar: Message, time = getDefaultRemoveTime(), messageName = 'defaultName', callback = (msg) => {}) => {
  // Alt. (Somehow) Compare freshest time, delete other timeout
  // console.log('DEBUG @delete1 for ' + messageName + ', addDelete(' + time + ') = ' + (!listToDeleteFrom.has(messageName) && !isUndefined(messageVar) && messageVar.content !== ''), listToDeleteFrom.has(messageName));
  messageName = `${messageName}.id=${messageVar.id}`;
  if (!listToDeleteFrom.has(messageName) && !isUndefined(messageVar) && (messageVar.content !== '' || messageVar.embeds.length > 0)) {
    if (!messageVar.content.includes('<removed>')) { // TODO: If repeated attempts are made to delete same thing, reflect if <removed> should be added
      listToDeleteFrom.set(messageName, messageVar);
    } else {
      console.error('DEBUG Multiple Removal:', messageName);
    }
  }
  deleteIntervals.push(setTimeout(() => {
    console.log(`----- @Delete Message --- for ${messageName}:`, listToDeleteFrom.has(messageName), time);
    if (listToDeleteFrom.has(messageName)) { // Makes sure it isn't already deleted
      console.log('DEBUG @f.deleteDiscMessage', messageName, listToDeleteFrom.has(messageName));
      listToDeleteFrom.delete(messageName);
      messageVar.delete()
        .then((res) => {
          callback(res); // Use optional callback (Default noop)
        }).catch((err) => {
          console.log(`@delete for ${messageName} (${time}): \n${err}`);
          callback(messageVar);	// Call callback anyway, even if print isn't made
        });
    }
  }, time));
};

// Used on exit, should delete all messages that are awaiting deletion instantly
export const onExitDelete = function () {
  console.log('DEBUG @onExitDelete: --- EXITING --- Deleting all messages awaiting deletion');
  const mapIter = listToDeleteFrom.values();
  deleteIntervals.map(interval => clearInterval(interval));
  for (let i = 0; i < listToDeleteFrom.size; i++) {
    const ele = mapIter.next().value;
    // console.log(ele.content);
    ele.delete()
      .catch(err => console.log(`@onExitDelete${err}`));
  }
};

function callbackPrintDefault(message) {
  deleteDiscMessage(message);
}

export const writeToFile = async (filePath: string, contentToWrite, messageOnSuccess?: string): Promise<boolean> => {
  try {
    await fs.writeFile(filePath, contentToWrite);
    if (messageOnSuccess) console.log('@writeToFile:', messageOnSuccess);
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const readFromFile = async (filePath: string, messageRead?: string) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    if (messageRead) console.log('@readFromFile:', messageRead + data);
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Takes an Array of Players and returns an Array of GuildMembers with same ids
export const teamToGuildMember = (team, activeMembers) => {
  const teamMembers = [];
  if (isUndefined(activeMembers)) {
    console.error('Error: activeMembers not initialized in @teamToGuildMember (Test case = ok)'); // Since it is assumed to always be initialized, throw error otherwise
  } else {
    team.forEach((player) => {
      const guildMember = activeMembers.find(guildMember => player.uid === guildMember.id);
      // console.log('@teamToGuildMember member:', player.uid, guildMember.id);
      if (!isUndefined(guildMember)) {
        teamMembers.push(guildMember);
      }
    });
  }
  console.log('@teamToGuildMember SIZE', teamMembers.length, activeMembers.length, team.length);
  if (teamMembers.length !== activeMembers.length) console.error('DEBUG teamToGuildMember ERROR different size');
  return teamMembers;
};

// Idea put on hold - hard to detect character width
// gets longestName length
export const getLongestNameLength = (activePlayers) => {
  let longestName = -1;
  activePlayers.forEach((oneData) => {
    if (oneData.userName.length > longestName) {
      longestName = oneData.userName.length;
    }
  });
  return longestName;
};

/*
	Returns string of tabs to align to given biggest name
	Example:
	Petter - 6
	Bambi på hal is - 15
	diff = 9
	s = ' \t\t\t'
	s2 = '\t'
*/
// TODO Print``
/*
const getTabsForName = function (nameLength, longestName) {
  console.log('DEBUG: @getTabsForName', longestName, nameLength);
  const discTabSize = 4;
  const diff = longestName - nameLength;
  let s = '';
  for (let i = 0; i < (diff % discTabSize); i++) {
    s += '  ';
  }
  for (let i = 0; i < diff; i += discTabSize) {
    s += '\t';
  }
  return s;
};
*/

// Fisher yates shuffle list
export const shuffle = (array) => {
  let currentIndex = array.length; 
  let temporaryValue; let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
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

const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';
export const callbackInvalidCommand = (message) => {
	deleteDiscMessage(message, 15000, 'invalidCommand');
	message.react(emoji_error);
}

const emoji_modified = '🤚';
export const callbackModified = (message) => {
	deleteDiscMessage(message, 10000, 'modifiedMessage');
	message.react(emoji_modified);
}