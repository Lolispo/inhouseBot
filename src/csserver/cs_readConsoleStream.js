
const { handleMessageExported } = require("../bot");
const { writeConsole, getLatestConsoleLines } = require("./cs_console");

/*
hm, har en idé för att minska lite på mängden api spam. Man lär ju egentligen bara vilja skicka meddelanden till discord mellan matcher. 
Typ för att starta en ny. Det finns ett kommando som heter get5_status som kan berätta om en match är loaded eller inte. 
Man skulle kunna skicka det typ varje minut och om ingen match är loaded och det är >3 spelare på servern så börjar den polla för att se om nån skriver i chatten. 
Kanske till och med skickar en "say" när den börjar lyssna
bonus är att man kan använda det så att den vet när den ska kolla databasen för att se matchresultatet
den kommer fortfarande att tugga väldigt mycket lines när den väl är aktiv, men då sitter den iaf inte konstant och läser en massa useless shit
*/


const consoleMessages = [];
let lastSeen = '';
let refreshInterval;
let ingameInterval;

// Called when game is loaded on bot
const readCSConsoleInput = async (serverId, gameObject) => {
  // Check status on server every minute
  refreshInterval = setInterval(async () => {
    const getStatusRes = await writeConsole(serverId, 'get5_status');
    console.log('@readCSConsoleInput', getStatusRes);
    const latestLines = await getLatestConsoleLines(serverId)
    console.log('@readCSConsoleInput Latest Lines', latestLines);
    // TODO: Check if res can be used here or if we need to read from console

    if (true) { // TODO: If status changed to ongoing -> change mode OR >3 players
      clearInterval(refreshInterval);
      await writeConsole(serverId, 'say Started listening on discord commands ingame!');
      await readConsoleSayLines(serverId, gameObject);
    }
  }, 60000);
};



const clearIntervals = () => {
  clearInterval(refreshInterval);
  clearInterval(ingameInterval);
}

// Read console for "say" lines every 5 seconds
const readConsoleSayLines = async (serverId, gameObject) => {
  let counter = 0;
  ingameInterval = setInterval(async () => {
    const latestLines = await getLatestConsoleLines(serverId);
    const newMessages = [];
    // TODO: Split on console messages

    // TODO: Update local storage of messages to prevent multiple ones appearing
    for(let i = latestLines.length - 1; i >= 0; i--) {
      if (latestLines[i] === lastSeen) {
        if (i === latestLines.length - 1) {
          newMessages = [];
        } else {
          newMessages = latestLines.slice(i + 1);
        }
      }
    }
    
    // Loop over ONLY new messages

    newMessages.forEach(message => {
      // TODO: Check for correct format of message
      // Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"
  
      if (message.match(/<STEAM_\d:\d:\d+><(CT|T)>" say/g)) {    
        // If message is found
        // TODO: Find author of message from given steamID in message
        const player = findAuthorFromMessage(message, gameObject);
  
        // TODO Discord handle message content
        if(player) {
          const messageObject = {
            ...gameObject.getChannelMessage(),
            author: { 
              uid: player.uid
            },
            content: message
          }
          handleMessageExported(messageObject);
        }
      }
    })
    
    // Update content with new messages
    consoleMessages.concat(newMessages);
    lastSeen = newMessages[newMessages.length - 1];

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
  let steamid = tempString.substring(0, tempString.indexOf('>'));

  // TODO: Reference existing loading players to find correct one
  console.log('@findAuthorFromMessage: Gameobject', gameObject);
  let players = [];
  const player = players.find((player) => player.steamid === steamid);
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