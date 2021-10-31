
const { datHostEndpoint } = require('./cs_server_http');

export const loadConfigFile = async (serverId, filePath = 'cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg') =>
  // game-servers/5ee3fe74d451b92ec776d519/files/cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg
  datHostEndpoint(`game-servers/${serverId}/console`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: `line=get5_loadmatch%20${filePath}`,
    // 'get5_loadmatch%20cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg' // application/x-www-form-urlencoded'
    // line: `get5_loadmatch ${filePath}`
  });


// Fetch file after synching cache
// TODO: Should it always require sync? Parameter for not sync
export const fetchFile = async (serverId, filePath = 'get5stats/get5_matchstats_1.cfg') => {
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

    },
  });
};

// Write line in cs server console
export const writeConsole = async (serverId, line) => datHostEndpoint(`game-servers/${serverId}/console`, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  data: `line=${line}`,
});

export const getLatestConsoleLines = async (serverId, amount = 100) => datHostEndpoint(`game-servers/${serverId}/console?max_lines=${amount}`);

export const cancelGameCSServer = async (gameObject) => {
  const serverId = gameObject.getServerId(); // Fetch serverId from gameObject
  if (serverId) { return writeConsole(serverId, 'get5_endmatch;'); }
  console.error('@cancelgameCSServer Error: Invalid serverId:', serverId);
  return null;
};
