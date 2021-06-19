
import { handleMessageExported } from '../bot';
import { writeConsole, getLatestConsoleLines } from './cs_console';
import { getGameStats } from './cs_server_stats';
import { clearIntervals } from '../game/game';
import { findPlayerWithGivenSteamId } from '../steamid';

/*
hm, har en idé för att minska lite på mängden api spam. Man lär ju egentligen bara vilja skicka meddelanden till discord mellan matcher.
Typ för att starta en ny. Det finns ett kommando som heter get5_status som kan berätta om en match är loaded eller inte.
Man skulle kunna skicka det typ varje minut och om ingen match är loaded och det är >3 spelare på servern så börjar den polla för att se om nån skriver i chatten.
Kanske till och med skickar en "say" när den börjar lyssna
bonus är att man kan använda det så att den vet när den ska kolla databasen för att se matchresultatet
den kommer fortfarande att tugga väldigt mycket lines när den väl är aktiv, men då sitter den iaf inte konstant och läser en massa useless shit
*/


let consoleMessages = [];
let lastSeen = '';

const uniteChannels = (gameObject) => {
  console.log('@uniteChannels');
  const messageObject = gameObject.getFreshMessage();
  const hostMessage = gameObject.getMatchupMessage();
  messageObject.author = hostMessage.author;
  messageObject.content = '-unite';
  handleMessageExported(messageObject);
};

// Called when game is loaded on bot
export const readCSConsoleInput = async (serverId, gameObject) => {
  // Check status on server every minute
  const localInterval = setInterval(async () => {
    const getStatusRes = await writeConsole(serverId, 'get5_status');
    const latestLines = await getLatestConsoleLines(serverId);
    console.log('@readCSConsoleInput Latest Lines', latestLines);
    const splittedMessages = latestLines.data.lines;
    consoleMessages = consoleMessages.concat(splittedMessages);
    lastSeen = consoleMessages[consoleMessages.length - 1];
    console.log('Last Seen Initial:', lastSeen);

    if (true) { // TODO: If status changed to ongoing -> change mode OR >3 players
      clearInterval(localInterval);
      await writeConsole(serverId, 'say Started listening to discord commands ingame!');
      await readConsoleSayLines(serverId, gameObject);
    }
  }, 6000); // TODO: 60000
  gameObject.setIntervalPassive(localInterval);
};

export const isSayMessage = (message) => {
  if (message.match(/.*STEAM_\d:\d:\d+.*" say.*/g)) {
    return message.substring(message.indexOf('say "') + 5, message.length - 1);
  }
  return false;
};

// L 06/23/2020 - 22:25:30: Game Over: competitive mg_active de_inferno score 16:9 after 43 min
// Jun 27 21:48:07:  L 06/27/2020 - 21:48:07: Game Over: competitive mg_active de_vertigo score 16:13 after 22 min
export const gameOverMessage = message => message.match(/(.{3} \d+ \d\d:\d\d:\d\d:)?\s* L \d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d: Game Over: competitive mg_active .* score \d+:\d+ after \d+ min/g);

// Read console for "say" lines every 5 seconds
const readConsoleSayLines = async (serverId, gameObject) => {
  let counter = 0;
  const localInterval = setInterval(async () => {
    const latestLines = await getLatestConsoleLines(serverId, 125);
    let newMessages = [];
    // console.log('@readConsoleSayLines: latestLines:', latestLines);
    // TODO: Split on console messages
    const splittedMessages = latestLines.data.lines;

    // console.log('splittedMessages:', splittedMessages);

    // console.log('DEBUG : First and LAST:', splittedMessages.length, splittedMessages[0], splittedMessages[splittedMessages.length - 1]);

    // Update local storage of messages to prevent multiple ones appearing
    // console.log('Last Seen message:', lastSeen);
    let noLastFound = true;
    for (let i = splittedMessages.length - 1; i >= 0; i--) {
      if (splittedMessages[i] === lastSeen) {
        noLastFound = false;
        if (i != splittedMessages.length - 1) console.log('New messages:', (splittedMessages.length - 1 - i));
        if (i === splittedMessages.length - 1) {
          newMessages = [];
          break;
        } else { // Should not include lastSeen Message
          newMessages = splittedMessages.slice(i + 1);
          break;
        }
      }
    }

    // If last message wasn't found, then handle all as new
    // Can potentially miss commands if too many messages
    if (noLastFound) {
      newMessages = splittedMessages;
    }

    // console.log('@ length:', newMessages.length);
    if (newMessages.length === 0) {
      // TODO: Fix DEBUG mode which enables these prints
      // console.log('DEBUG No new messages. LastSeen:', lastSeen);
      return;
    }
    lastSeen = newMessages[newMessages.length - 1];
    console.log('DEBUG New Messages:', newMessages.length, 'New Last:', lastSeen);
    /* '\n', {
      last: splittedMessages[splittedMessages.length - 1],
      sndlast: splittedMessages[splittedMessages.length - 2],
      trdlast: splittedMessages[splittedMessages.length - 3],
    }); */

    // Update content with new messages
    consoleMessages = consoleMessages.concat(newMessages);
    // lastSeen = consoleMessages[consoleMessages.length - 1];
    // console.log('DEBUG Last Seen:', lastSeen);

    // Loop over ONLY new messages

    newMessages.forEach((message) => {
      // TODO: Check for correct format of message
      // Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"
      // console.log('new msg (spam):', message);

      // TODO: Check if game has ended
      const gameHasEnded = gameOverMessage(message);
      if (gameHasEnded) {
        console.log('@gameHasEnded');
        getGameStats(serverId, gameObject);
        uniteChannels(gameObject);
        clearIntervals(gameObject);
        console.log('DEBUG gameEnd PLAYERS:', gameObject.getActiveMembers());
      }

      const spokenWord = isSayMessage(message);
      if (spokenWord) { // ><(CT|T)>
        console.log('NEW SAY!', spokenWord);
        // If message is found
        // TODO: Find author of message from given steamID in message
        const player = findAuthorFromMessage(message, gameObject);

        // Discord handle message content

        if (player) {
          // Override channelMessage from
          const messageObject = gameObject.getFreshMessage();
          // Point author to other existing user instead of changing user
          // messageObject.author.id = player.uid;
          // messageObject.author.username = player.userName;
          messageObject.author = messageObject.guild.members.cache.find(user => user.id === player.uid);
          messageObject.content = spokenWord;
          handleMessageExported(messageObject);
        } else {
          console.log('AUTHOR PLAYER NOT FOUND!', message);
        }
      }
    });


    // TODO: Exit condition when it should stop
    counter++;
    if (counter > 1440) {
      // const 5:e sekund i 2h
      clearInterval(localInterval);
    }
  }, 5000);
  gameObject.setIntervalActive(localInterval);
};

// Find player instance from message
const findAuthorFromMessage = (message, gameObject) => {
  // TODO Regex match SteamID
  // Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"
  // No regex solution test
  const tempString = message.substring(message.indexOf('<STEAM'));
  const steamid = tempString.substring(1, tempString.indexOf('>'));

  // Reference existing loading players to find correct one
  console.log('@findAuthorFromMessage: SteamId:', steamid);
  const balanceInfo = gameObject.getBalanceInfo();
  const players = balanceInfo.team1.concat(balanceInfo.team2);
  const player = findPlayerWithGivenSteamId(players, steamid);
  if (player) {
    // Valid player provided message
    return player;
  }
  return null;
};
