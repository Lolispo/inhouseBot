
const bot = require("../bot");
const { writeConsole, getLatestConsoleLines } = require("./cs_console");
const { getGameStats } = require('./cs_server_stats');

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
let refreshInterval;
let ingameInterval;

// Called when game is loaded on bot
const readCSConsoleInput = async (serverId, gameObject) => {
  // Check status on server every minute
  refreshInterval = setInterval(async () => {
    const getStatusRes = await writeConsole(serverId, 'get5_status');
    const latestLines = await getLatestConsoleLines(serverId);
    console.log('@readCSConsoleInput Latest Lines', latestLines);
    const splittedMessages = latestLines.data.lines;
    consoleMessages = consoleMessages.concat(splittedMessages);
    lastSeen = consoleMessages[consoleMessages.length - 1];
    console.log('Last Seen Initial:', lastSeen);

    if (true) { // TODO: If status changed to ongoing -> change mode OR >3 players
      clearInterval(refreshInterval);
      await writeConsole(serverId, 'say Started listening to discord commands ingame!');
      await readConsoleSayLines(serverId, gameObject);
    }
  }, 6000); // TODO: 60000
};



const clearIntervals = () => {
  clearInterval(refreshInterval);
  clearInterval(ingameInterval);
}

const isSayMessage = (message) => {
  if (message.match(/.*STEAM_\d:\d:\d+.*" say.*/g)) {
    return message.substring(message.indexOf('say "') + 5, message.length - 1);
  }
  return false;
}

// Read console for "say" lines every 5 seconds
const readConsoleSayLines = async (serverId, gameObject) => {
  let counter = 0;
  ingameInterval = setInterval(async () => {
    const latestLines = await getLatestConsoleLines(serverId, 50);
    let newMessages = [];
    // console.log('@readConsoleSayLines: latestLines:', latestLines);
    // TODO: Split on console messages
    const splittedMessages = latestLines.data.lines;

    // console.log('splittedMessages:', splittedMessages);

    // Update local storage of messages to prevent multiple ones appearing
    // console.log('Last Seen message:', lastSeen);
    for(let i = splittedMessages.length - 1; i >= 0; i--) {
      if (splittedMessages[i] === lastSeen) {
        // console.log('MATCH Last seen')
        if (i === splittedMessages.length - 1) {
          newMessages = [];
        } else { // Should not include lastSeen Message
          newMessages = splittedMessages.slice(i + 1);
        }
      }
    }
    
    // console.log('@ length:', newMessages.length);
    if (newMessages.length < 0) return;

    // Loop over ONLY new messages

    newMessages.forEach(message => {
      // TODO: Check for correct format of message
      // Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"
      // console.log('new msg (spam):', message);
      
      // TODO: Check if game has ended 
      let gameHasEnded = false;
      if (gameHasEnded) {
        getGameStats(serverId, gameObject);
      }
      
      let spokenWord = isSayMessage(message);
      if (spokenWord) { // ><(CT|T)>
        console.log('NEW SAY!', spokenWord);
        // If message is found
        // TODO: Find author of message from given steamID in message
        const player = findAuthorFromMessage(message, gameObject);
  
        // Discord handle message content

        if (player) {
          /*
TypeError: Cannot read property 'channels' of undefined
    at Object.exports.split (C:\Users\Petter\Documents\GitHub\inhouseBot\src\voiceMove.js:39:47)
    at handleMessage (C:\Users\Petter\Documents\GitHub\inhouseBot\src\bot.js:445:18)
    at Object.exports.handleMessageExported (C:\Users\Petter\Documents\GitHub\inhouseBot\src\bot.js:180:46)
    at newMessages.forEach.message (C:\Users\Petter\Documents\GitHub\inhouseBot\src\csserver\cs_console_stream.js:107:15)
    at Array.forEach (<anonymous>)
    at Timeout.setInterval [as _onTimeout] (C:\Users\Petter\Documents\GitHub\inhouseBot\src\csserver\cs_console_stream.js:84:17)
    at <anonymous>


     TypeError: Cannot read property 'voiceChannel' of null
    at Object.exports.split (C:\Users\Petter\Documents\GitHub\inhouseBot\src\voiceMove.js:40:53)
    at handleMessage (C:\Users\Petter\Documents\GitHub\inhouseBot\src\bot.js:445:18)
    at Object.exports.handleMessageExported (C:\Users\Petter\Documents\GitHub\inhouseBot\src\bot.js:180:46)
    // requires: guild.channels
          */
          // TODO: Need to perhaps have alternative way of interacting with discord functions
          // Perhaps implement unite / split and give feedback ingame aswell
          
          // TODO: Get fresh message with updated voice info and correct text channel set

          // Send message to get meta information in playground which you can remove immedaitely
          // Gets updated version of which channel is in BUT is in the wrong text channel

          // Override channelMessage from
          const messageObject = gameObject.getChannelMessage();
          messageObject.author = {
            id: player.uid,
            username: player.userName,
          }
          messageObject.content = spokenWord;
          // console.log(' --- discHandleMessage', gameObject.getChannelMessage().guild);
          bot.handleMessageExported(messageObject);
        } else {
          console.log('AUTHOR PLAYER NOT FOUND!', message);
        }
      }
    })
    
    // Update content with new messages
    consoleMessages = consoleMessages.concat(newMessages);
    lastSeen = consoleMessages[consoleMessages.length - 1];

    // TODO: Exit condition when it should stop
    counter++;
    if (counter > 1440) {
      // Var 5:e sekund i 2h
      clearInterval(ingameInterval);
    }
  }, 5000);
}

// Find player instance from message
const findAuthorFromMessage = (message, gameObject) => {
  // TODO Regex match SteamID
  // Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"
  // No regex solution test
  let tempString = message.substring(message.indexOf('<STEAM'));
  let steamid = tempString.substring(1, tempString.indexOf('>'));

  // TODO: Reference existing loading players to find correct one
  console.log('@findAuthorFromMessage: SteamId:', steamid);
  const balanceInfo = gameObject.getBalanceInfo();
  const players = balanceInfo.team1.concat(balanceInfo.team2);
  const player = players.find((player) => player.steamId === steamid);
  if (player) {
    // Valid player provided message
    return player;    
  }
  return null;
}


module.exports = {
  readCSConsoleInput: readCSConsoleInput,
  clearIntervals : clearIntervals,
}