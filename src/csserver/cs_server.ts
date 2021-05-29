import fs from 'fs';
import util from 'util';
import FormData from 'form-data';
import { assert } from 'console';
import { getChosenMap } from './cs_map';
import { writeConsole, loadConfigFile, getLatestConsoleLines } from './cs_console';
import { datHostEndpoint } from './cs_server_http';
import { readCSConsoleInput } from './cs_console_stream';

// const querystring = require('querystring'); // querystring.stringify({ foo: 'bar' })

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export const gameServers = async () => {
  const response = await datHostEndpoint('game-servers', { method: 'GET' });
  if (response.statusCode === 200) {
    return response.data.map((server) => {
      const
        {
          id,
          ip, // SQL
          name,
          mysql_username,
          mysql_password,
          csgo_settings, // password
          ports, // game
          custom_domain,
        } = server;
      return {
        name,
        ip,
        id,
        mysql_username,
        mysql_password,
        csgo_settings,
        ports,
        custom_domain,
      };
    });
  }
  return response;
};

export const generateConfigFile = async (replacements, filePath, version = '-gen', fileType = '.cfg') => {
  let data;
  try {
    console.log('@generateConfigFile:', replacements);
    data = await readFile(filePath + fileType, 'utf8');
    const result = data
      .replace(/\$\$chosen\_map\$\$/g, replacements.chosen_map)
      .replace(/\$\$skip_veto\$\$/g, replacements.skipVeto)
      .replace(/\$\$coordinator\_prediction\_team1\$\$/g, replacements.coordinator_prediction_team1)
      .replace(/\$\$team1\_name\$\$/g, replacements.team1_name)
      .replace(/\$\$team2\_name\$\$/g, replacements.team2_name)
      .replace(/\$\$match\_id\$\$/g, replacements.match_id)
      .replace(/\$\$team1Players\$\$/g, replacements.team1Players)
      .replace(/\$\$team2Players\$\$/g, replacements.team2Players);

    // console.log(result);
    const wholePath = filePath + version + fileType;
    const writeFileRes = await writeFile(wholePath, result, 'utf8');
    // console.log('Wrote to file:', writeFileRes); // TODO: Fix print - undefined
    return wholePath;
  } catch (e) {
    console.error('IO Error:', e);
  }
  console.error('@generateConfigFile: Error');
  return null;
};

export const uploadFile = async (serverId, filePath, localPath) => {
  // game-servers/5ee3fe74d451b92ec776d519/files/cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg
  // console.log('@uploadFile', serverId, filePath, localPath);
  const formData = new FormData();
  formData.append('file', fs.createReadStream(localPath));
  return datHostEndpoint(`game-servers/${serverId}/files/${filePath}`, {
    method: 'POST',
    data: formData,
    headers: { // formData.getHeaders()
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      ...formData.getHeaders(),
    },
  }, 'Upload File');
};

const generateTeamPlayersBody = (players) => {
  let s = '';
  console.log('@generateTeamPlayersBody:', players.map(player => player.getSteamId()).join(', '));
  players.map((player, index) => {
    if (!player.getSteamId()) return null;
    s += `"${player.getSteamId()}" \t""\n`;
  });
  return s;
};

// Fix prediction
const getPredictionTeam1 = (balanceInfo) => {
  /*
    difference: 31,
    avgT1: 2572,
    avgT2: 2587.5,
    avgDiff: 15.5,

    Output: 1 - 99
    50: <no favorite> = avgT1 = avgT2
    > 50: team1 higher avg< 50: team 2 higher avg
    20% = 25 mmr

  */
  const {
    difference, avgT1, avgT2, avgDiff,
  } = balanceInfo;
  if (avgDiff < 1 && avgDiff >= 0) return 50;
  const diff = avgDiff * (10 / 25);
  return 50 + (avgT1 > avgT2 ? diff : -diff);
};

export const configureServer = async (gameObject) => {
  console.log('@configureServer: Map =', gameObject.chosenMap); // , gameObject.getBalanceInfo());
  const gameServersList = await gameServers();
  const serverId = gameServersList[0].id;
  // Update gameObject with serverId
  const matchId = Math.round(new Date().getTime() / 1000); // Epoch seconds
  gameObject.setServerId(serverId);
  gameObject.setMatchId(matchId);
  assert(gameObject.getServerId(), serverId);
  const team1Players = generateTeamPlayersBody(gameObject.getBalanceInfo().team1);
  const team2Players = generateTeamPlayersBody(gameObject.getBalanceInfo().team2);
  const mapVetoChosenMap = gameObject.chosenMap;
  const { chosenMap, skipVeto } = getChosenMap(mapVetoChosenMap);
  const predictionTeam1 = getPredictionTeam1(gameObject.getBalanceInfo());
  const replacements = {
    chosen_map: chosenMap,
    skipVeto,
    coordinator_prediction_team1: predictionTeam1 || 50, // TODO Prediction score
    team1_name: gameObject.getBalanceInfo().team1Name || 'Team 1',
    team2_name: gameObject.getBalanceInfo().team2Name || 'Team 2',
    match_id: matchId,
    ...(team1Players && { team1Players }),
    ...(team2Players && { team2Players }),
  };
  console.log('@configureServer ServerId:', serverId, gameObject.getServerId());
  const wholeFilePath = await generateConfigFile(replacements, 'cfg/kosatupp_inhouse_coordinator_match');
  console.log('@configureServer.filePath:', wholeFilePath);
  const filePathRemote = 'cfg%2Fget5%2Fkosatupp_inhouse_coordinator_match.cfg';
  const uploadedFileRes = await uploadFile(serverId, filePathRemote, wholeFilePath);
  const cmdResetRunningGames = await writeConsole(serverId, 'get5_endmatch;'); // TODO: Only run if gameongoing
  // TODO: Currently get5_check_auths is always set on server - check how to switch this
  const cmdCheckAuths = await writeConsole(serverId, `get5_check_auths ${team1Players && team2Players ? 1 : '0; say All users require a linked Steam ID for automatic team placement;'}`);
  // Load config
  const writeConsoleRes = await loadConfigFile(serverId);

  // Start reading input from server
  readCSConsoleInput(serverId, gameObject);
  const latestConsoleLines = getLatestConsoleLines(serverId);
  return latestConsoleLines;
};

// export const datHostEndpoint = (...args) => datHostEndpoint(...args);
