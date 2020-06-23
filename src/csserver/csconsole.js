
/*
hm, har en idé för att minska lite på mängden api spam. Man lär ju egentligen bara vilja skicka meddelanden till discord mellan matcher. 
Typ för att starta en ny. Det finns ett kommando som heter get5_status som kan berätta om en match är loaded eller inte. 
Man skulle kunna skicka det typ varje minut och om ingen match är loaded och det är >3 spelare på servern så börjar den polla för att se om nån skriver i chatten. 
Kanske till och med skickar en "say" när den börjar lyssna
bonus är att man kan använda det så att den vet när den ska kolla databasen för att se matchresultatet
den kommer fortfarande att tugga väldigt mycket lines när den väl är aktiv, men då sitter den iaf inte konstant och läser en massa useless shit
*/

const { datHostEndpoint } = require("./csserver")

// Called when game is loaded on bot
const readCSConsoleInput = (serverId) => {
  // Check status on server every minute
  const refreshInterval = setInterval(() => {
    const getStatusRes = writeConsole(serverId, 'get5_status');
    console.log('@readCSConsoleInput', getStatusRes);
    const latestLines = getLatestConsoleLines(serverId)
    console.log('@readCSConsoleInput Latest Lines', latestLines);
    // TODO: Check if res can be used here or if we need to read from console

    if (true) { // TODO: If status changed to ongoing -> change mode OR >3 players
      clearInterval(refreshInterval);
      writeConsole(serverId, 'say Started listening on discord commands ingame!');
      readConsoleSayLines();
    }
  }, 60000);
};

const consoleMessages = [];

// Read console for "say" lines every 5 seconds
const readConsoleSayLines = () => {
  let counter = 0;
  let interval = setInterval(() => {
    const latestLines = getLatestConsoleLines(serverId);
    const newMessages = [];
    // TODO: Split on console messages

    // TODO: Update local storage of messages to prevent multiple ones appearing
    latestLines.forEach(message => {
      if (!consoleMessages.includes(message)) {
        newMessages.push(message);
      }
    })
    
    // TODO: Loop over ONLY new messages

    newMessages.forEach(message => {
      // TODO: Check for correct format of message
      // Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"
  
      // If message is found
      // TODO: Find author of message from given steamID in message
      const player = findAuthorFromMessage(message);

      // TODO Discord handle message content
      // handleMessage(player);

    })
    
    // Update content with new messages
    consoleMessages.concat(newMessages);

    // TODO: Exit condition when it should stop
    counter++;
    if (counter > 1440) {
      // Var 5:e sekund i 2h
      clearInterval(interval);
    }
  }, 5000);
}

// Find player instance from message
const findAuthorFromMessage = (message) => {
  // TODO Regex match SteamID
  // Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"
  let steamid = '';

  // TODO: Reference existing loading players to find correct one
  let players = [];
  const player = players.find((player) => player.steamid === steamid);
  if (player) {
    // Valid player provided message
    return player;    
  }
}

const loadConfigFile = async (serverId, filePath='cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg') => {
  // game-servers/5ee3fe74d451b92ec776d519/files/cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg
  return datHostEndpoint(`game-servers/${serverId}/console`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' } ,
    data: 'line=get5_loadmatch%20' + filePath 
      //'get5_loadmatch%20cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg' // application/x-www-form-urlencoded'
      // line: `get5_loadmatch ${filePath}`
  })
}

// Write line in cs server console
const writeConsole = async (serverId, line) => {
  return datHostEndpoint(`game-servers/${serverId}/console`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' } ,
    data: 'line=' + line
  })
}

const getLatestConsoleLines = async (serverId, amount = 100) => {
  return datHostEndpoint(`game-servers/${serverId}/console?max_lines=${amount}`);
}


module.exports = {
  readCSConsoleInput: readCSConsoleInput,
  loadConfigFile : loadConfigFile,
  writeConsole : writeConsole,
  getLatestConsoleLines : getLatestConsoleLines,
}