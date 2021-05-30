
// Author: Petter Andersson

// Should handle general help functions
import * as fs from 'fs';

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

// Used to print message in channel, use for every use of channel.send for consistency
// Returns promise for use in async functions
export const print = function (messageVar, message, callback = callbackPrintDefault) {
  console.log(`> ${message.embed ? `(Embed)${message.embed.title}\t${message.embed.description}` : message}`);
  if (message.length >= 2000) {
    let sent = false;
    for (let i = 2000; i >= 0; i--) {
      if (message.charAt(i) === '\n') {
        const firstMessage = message.substring(0, i);
        const restMessage = message.substring(i);
        messageVar.channel.send(firstMessage)
          .then((result) => {
            callback(result);
          }).catch(err => console.log(`@print (splitted) for ${message} :\n${err}`));
        print(messageVar, restMessage, callback);
        sent = true;
        break;
      }
    }
    if (!sent) { // No newline in message, split content on max size
      const maxIndex = 1900;
      const firstMessage = message.substring(0, maxIndex); // Margin
      const restMessage = message.substring(maxIndex);
      messageVar.channel.send(firstMessage)
        .then((result) => {
          callback(result);
        }).catch(err => console.log(`@print (splitted) for ${message} :\n${err}`));
      print(messageVar, restMessage, callback);
    }
  } else {
    messageVar.channel.send(message)
      .then((result) => {
        callback(result);
      }).catch(err => console.log(`@print for ${message} :\n${err}`));
  }
};

const listToDeleteFrom = new Map();
const deleteIntervals = [];

export const deleteDiscMessage = (messageVar, time = getDefaultRemoveTime(), messageName = 'defaultName', callback = (msg) => {}) => {
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

export const writeToFile = (filePath, contentToWrite, messageOnSuccess) => {
  fs.writeFile(filePath, contentToWrite, (err) => {
	    if (err) {
	        return console.log(err);
	    }
	    console.log(messageOnSuccess);
  });
};

export const readFromFile = function (filePath, messageRead, callback, callbackError) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err || isUndefined(data)) {
      console.log(err);
      callbackError();
    } else {
      console.log(messageRead + data);
      callback(data);
    }
  });
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
const getTabsForName = function (nameLength, longestName) {
  console.log('DEBUG: @getTabsForName', longestName, nameLength);
  const discTabSize = 4;
  const diff = longestName - nameLength;
  let s = '';
  /*
	for(let i = 0; i < diff; i++){
		s += ' ';
	} */
  for (let i = 0; i < (diff % discTabSize); i++) {
    s += '  ';
  }
  for (let i = 0; i < diff; i += discTabSize) {
    s += '\t';
  }
  return s;
};
