
const { datHostEndpoint } = require("./cs_server_http");

const loadConfigFile = async (serverId, filePath='cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg') => {
  // game-servers/5ee3fe74d451b92ec776d519/files/cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg
  return datHostEndpoint(`game-servers/${serverId}/console`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' } ,
    data: 'line=get5_loadmatch%20' + filePath 
      //'get5_loadmatch%20cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg' // application/x-www-form-urlencoded'
      // line: `get5_loadmatch ${filePath}`
  })
}

// Fetch file after synching cache
// TODO: Should it always require sync? Parameter for not sync
const fetchFile = async (serverId, filePath='get5stats/get5_matchstats_1.cfg') => {
  // game-servers/5ee3fe74d451b92ec776d519/files/cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg
  await datHostEndpoint(`game-servers/${serverId}/sync-files`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  return datHostEndpoint(`game-servers/${serverId}/files/${filePath}`, { // as_text
    method: 'GET',
    headers: {
      
    }
  });
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

const cancelGameCSServer = async (gameObject) => {
  const serverId = gameObject.getServerId(); // Fetch serverId from gameObject
  if (serverId) 
    return writeConsole(serverId, `get5_endmatch;`);
  console.error('@cancelgameCSServer Error: Invalid serverId:', serverId, gameObject);
  return null;
}


module.exports = {
  loadConfigFile : loadConfigFile,
  writeConsole : writeConsole,
  getLatestConsoleLines : getLatestConsoleLines,
  cancelGameCSServer : cancelGameCSServer,
  fetchFile : fetchFile,
}