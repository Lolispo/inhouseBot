import * as f from '../tools/f';

import * as vdf from 'simple-vdf';
import { fetchFile } from './cs_console';

import { printMessage } from '../bot';

import { updateMMR } from '../game/mmr';
import { cleanOnGameEnd, Game } from '../game/game';
import { convertIdFrom64 } from '../steamid';

const fetchStatsFile = async (serverId, matchId = '1') => {
  // let filePath = 'cfg%2Fget5%2Fget5_matchstats_$$XXX$$.cfg';
  let filePath = 'get5stats/get5_matchstats_$$XXX$$.cfg';
  filePath = filePath.replace('$$XXX$$', matchId);
  return fetchFile(serverId, filePath);
};

const cleanStatsFile = () => {
  // TODO: Remove locally stored file
  // But I don't store it locally Michael, I dont have to remove it?
};

/*
+------+-------+--------+---------+-----+-----+-----------+------------+--------+----+----+----+----+-------------+--------------+
| Name | Kills | Deaths | Assists | ADR | HS% | Entry (T) | Entry (CT) | Trades | 5k | 4k | 3k | 2k | Bomb plants | Bomb defuses |
+------+-------+--------+---------+-----+-----+-----------+------------+--------+----+----+----+----+-------------+--------------+
|      |       |        |         |     |     |           |            |        |    |    |    |    |             |              |
+------+-------+--------+---------+-----+-----+-----------+------------+--------+----+----+----+----+-------------+--------------+

*/

const genSpaces = num => ' '.repeat(num);

const tableTitleArray = [
  'Name       ',
  ' K  D  A ', //  37/23/23
  'ADR',
  'HS%',
  'Et.T', // Entry 🏃
  'Et.CT',
  'Tr.', // Trades ⇄
  '5k',
  '4k',
  '3k',
  '2k',
  'Bomb', // Plants Defuses
  'FA',
]; // 13

const dataFields = [
  'Name',
  'Kills',
  'Deaths',
  'Assists',
  'ADR',
  'HS%',
  'Ent. T +',
  'Ent. T -',
  'Ent. CT +',
  'Ent. CT -',
  'Trades',
  '5k',
  '4k',
  '3k',
  '2k',
  'Plants',
  'Defuses',
  'FA', // flashbang_assists
]; // 17

const tableTitles = () => `| ${tableTitleArray.join(' | ')} |\n`;

// pad column to fit in table design
export const padColumn = (index, value = '-') => {
  // console.log('@padColumn', index, value);
  const columnTitle = tableTitleArray[index];
  const titleLength = columnTitle.length;
  const valueLength = value.length;
  if (valueLength < titleLength) {
    // Pad with spaces
    return ` ${value}${genSpaces(titleLength - valueLength)} `;
  } if (valueLength === titleLength) {
    return ` ${value} `;
  }
  // @padColumn LOOK INTO THIS 100% HS%
  if (valueLength < titleLength + 2) {
    if (valueLength === titleLength + 1) return `${value} `;
    console.log('@padColumn LOOK INTO THIS', value, columnTitle);
    return value;
  }
  return (`${value}`).substring(0, titleLength);
};

const shortenName = (name, maxsize = 10) => {
  if (name.length > maxsize) {
    return `${name.substring(0, maxsize)}.`;
  }
  return name;
};

const highestScoreObject = {
  index: undefined
};

const setHighestScore = (array, arrayIndex) => {
  array.forEach((value, index) => {
    if (highestScoreObject[index] && highestScoreObject[index].value) {
      // Compare to highestScoreObject
      if (index === 0) {} // No comparison (name)
      if (index === 2) { // Deaths compare to lowest
        if (value < highestScoreObject[index].value) {
          highestScoreObject[index].value = value;
          highestScoreObject[index].index = arrayIndex;
        } else if (value === highestScoreObject[index].value) {
          highestScoreObject.index = [].concat(highestScoreObject[index].index, arrayIndex);
        }
      } else { // Highest best
        if (value > highestScoreObject[index].value) {
          console.log('New highest!', value, dataFields[index], arrayIndex);
          highestScoreObject[index].value = value;
          highestScoreObject[index].index = arrayIndex;
        } else if (value === highestScoreObject[index].value) {
          highestScoreObject.index = [].concat(highestScoreObject[index].index, arrayIndex);
        }
      }
    } else if (value && value !== '-') { // First value
      if (index !== 0) {
        highestScoreObject[index] = {
          value,
          index: arrayIndex,
        };
      } // No comparison (name)
    }
  });
};

const padTo2 = value => (value.length === 1 ? ` ${value}` : value);

// | MorganTheJ. | 28/22/ 9  | 140 | 39% | 6/3  | 5/4   | 2   | -  | 2  | -  | 7  | -/-  | -  |
const adjustStrings = (arrayOfArrays) => {
  const deathsIndex = 2;
  const assistsIndex = 3;
  const indexT = 7;
  const indexCT = 9;
  const defusesIndex = 16;
  return arrayOfArrays.map((array) => {
    // console.log('@adjustedStrings Start', array.length, array);
    const deaths = array[deathsIndex];
    const assists = array[assistsIndex];
    const entryTDeaths = array[indexT];
    const entryCTDeaths = array[indexCT];
    const defuses = array[defusesIndex];
    const tempArray = array.filter((_, index) => !(index === indexT || index === indexCT || index === deathsIndex || index === assistsIndex || index === defusesIndex));
    // Expected order: name, KDA, ADR, etc
    const adjustedArray = tempArray.map((value, index) => {
      if (index === 1) return `${padTo2(value)}/${padTo2(deaths)}/${padTo2(assists)}`; // KDA
      if (index === 2) return `${value}`; // Adr
      if (index === 3) return `${value}%`; // HS Perc
      if (index === 4) return `${value}/${entryTDeaths}`;
      if (index === 5) return `${value}/${entryCTDeaths}`;
      if (index === 11) return `${value}/${defuses}`;
      return value;
    });
    console.log('@adjustedStrings end', adjustedArray.length, adjustedArray);
    return adjustedArray;
  });
};

const buildMapStatsMessage = (mapTeam) => {
  let s = '';
  const playerArrays = [];
  let loopIndex = 0;
  for (const key in mapTeam) {
    if (mapTeam.hasOwnProperty(key)) {
      const playerArray = [];
      const player = mapTeam[key];
      if (key === 'score') continue;

      // Get stats values for player

      const {
        name, kills, deaths, assists,
      } = player;
      const adr = Math.floor(player.damage / player.roundsplayed); // + ' DPR';
      const hsPercentage = (parseInt(player.headshot_kills) || 0) / kills;
      const hsPerc = f.prettifyPercentage(hsPercentage);
      const {
        firstkill_t, firstdeath_t, firstkill_ct, firstdeath_ct,
      } = player;
      const entriesT = parseInt(firstkill_t) || 0;
      const failedEntriesT = parseInt(firstdeath_t) || 0;
      const entriesCT = parseInt(firstkill_ct) || 0;
      const failedEntriesCT = parseInt(firstdeath_ct) || 0;
      const kill5_rounds = player['5kill_rounds'] || '-';
      const kill4_rounds = player['4kill_rounds'] || '-';
      const kill3_rounds = player['3kill_rounds'] || '-';
      const kill2_rounds = player['2kill_rounds'] || '-';

      playerArray.push(shortenName(name));
      playerArray.push(kills || '0');
      playerArray.push(deaths || '0');
      playerArray.push(assists || '0');
      playerArray.push(adr);
      playerArray.push(hsPerc);
      playerArray.push(entriesT);
      playerArray.push(failedEntriesT);
      playerArray.push(entriesCT);
      playerArray.push(failedEntriesCT);
      playerArray.push(player.tradekill || '-');
      playerArray.push(kill5_rounds);
      playerArray.push(kill4_rounds);
      playerArray.push(kill3_rounds);
      playerArray.push(kill2_rounds);
      playerArray.push(player.bomb_plants || '-');
      playerArray.push(player.bomb_defuses || '-');
      playerArray.push(player.flashbang_assists || '-');

      setHighestScore(playerArray, loopIndex);

      playerArrays.push(playerArray);
      loopIndex++;
    }
  }

  // Set bolded for highest values
  // hightlightHighestValues(playerArrays, highestScoreObject); // Not relevant until styling changes
  const fixedPlayerArray = adjustStrings(playerArrays);

  const sortedArrays = fixedPlayerArray.sort((a, b) => parseInt(a[1]) < parseInt(b[1]));
  console.log('SIZES:', tableTitleArray.length, fixedPlayerArray.length, sortedArrays.length);
  for (let i = 0; i < sortedArrays.length; i++) {
    // console.log('@loop last', tableTitleArray[i], sortedArrays[i]);
    s += '|';
    s += sortedArrays[i].map((entry, index) => {
      return padColumn(index, entry);
    }).join('|');
    s += '|\n';
  }
  return s;
};

// Builds the stats string to send in discord
export const buildStatsMessage = (stats) => {
  let s = '';
  for (let i = 0; i < 1; i++) {
    // Check only give results for one game
    const map = stats[`map${i}`];
    if (!map) return null;
    const { winner } = map;
    const teamWonName = stats[`${winner}_name`];
    console.log('@buildStatsMessage DEBUG', winner, teamWonName);
    s += `${teamWonName} won! `;
    const scoreResult = `${map.team1.score}-${map.team2.score}`;
    s += `${scoreResult}\n`;
    if (map) {
      s += `${stats.team1_name}:\n`;
      s += tableTitles();
      s += buildMapStatsMessage(map.team1);
      s += `${stats.team2_name}:\n`;
      s += tableTitles();
      s += buildMapStatsMessage(map.team2);
    }
  }
  return `\`\`\`${s}\`\`\``; // TODO: Include some explanation after message in footer?
};

// Send stats message to discord in the correct channel
export const sendStatsDiscord = (gameObject: Game, statsMessage) => {
  // Sends in channel
  printMessage(statsMessage, gameObject.getChannelMessage(), (message) => {
    f.deleteDiscMessage(message, 3600000, `statsresultsgame${Math.floor(Math.random() * 10)}`);
  });
  // TODO Send in game results chat which do not clear
};

// Checks if the stats file has the same players in both teams as the gameObject
const samePlayersInTeams = (gameObject: Game, stats) => {
  // TODO: Check if same players between file and content
  /*
  const team1 = gameObject.getBalanceInfo().team1;
  const team2 = gameObject.getBalanceInfo().team2;
  const serverTeam1 = stats.map0.team1;
  const serverTeam2 = stats.map0.team2;
  */
  // Temp: Check same teamnames
  const { team1Name } = gameObject.getBalanceInfo();
  const { team2Name } = gameObject.getBalanceInfo();
  const serverTeam1Name = stats.team1_name;
  const serverTeam2Name = stats.team2_name;
  console.log('@samePlayersInTeam:', team1Name === serverTeam1Name && team2Name === serverTeam2Name);
  return team1Name === serverTeam1Name && team2Name === serverTeam2Name;
};

const remapTeam = (players, mapTeam) => {
  const obj = {};
  // console.log('@remapTeam Debug players:', players);
  for (const key in mapTeam) {
    if (mapTeam.hasOwnProperty(key)) {
      const player = mapTeam[key];
      // console.log('Debug player', player);
      if (key === 'score' || key === 'v1' || key === 'v2') continue;
      const { convertedId, altConvertedId } = convertIdFrom64(key);
      const playerDisc = players.find(player => player.getSteamId() === convertedId || player.getSteamId() === altConvertedId);
      if (playerDisc) {
        /*
 { roundsplayed: '20',
        name: 'Petter',
        damage: '2769',
        tradekill: '3',
        kills: 26,
        headshot_kills: '11',
        '2kill_rounds': '7',
        deaths: 7,
        firstkill_ct: '3',
        firstdeath_ct: '1',
        assists: 3,
        '1kill_rounds': '9',
        '3kill_rounds': '1',
        firstkill_t: '3',
        uid: '1' }
        */
        // Successfully found player
        obj[playerDisc.uid] = {
          // ...player,
          uid: playerDisc.uid,
          name: player.name,
          roundsplayed: parseInt(player.roundsplayed || 0),
          kills: parseInt(player.kills || 0),
          deaths: parseInt(player.deaths || 0),
          assists: parseInt(player.assists || 0),
          damage: parseInt(player.damage || 0),
          headshot_kills: parseInt(player.headshot_kills || 0),
          '1kill_rounds': parseInt(player['1kill_rounds'] || 0),
          '2kill_rounds': parseInt(player['2kill_rounds'] || 0),
          '3kill_rounds': parseInt(player['3kill_rounds'] || 0),
          '4kill_rounds': parseInt(player['4kill_rounds'] || 0),
          '5kill_rounds': parseInt(player['5kill_rounds'] || 0),
          tradekill: parseInt(player.tradekill || 0),
          firstkill_ct: parseInt(player.firstkill_ct || 0),
          firstdeath_ct: parseInt(player.firstdeath_ct || 0),
          firstkill_t: parseInt(player.firstkill_t || 0),
          firstdeath_t: parseInt(player.firstdeath_t || 0),
          bomb_plants: parseInt(player.bomb_plants || 0),
          bomb_defuses: parseInt(player.bomb_defuses || 0),
          flashbang_assists: parseInt(player.flashbang_assists || 0),
        };
      } else {
        console.error('ERROR: Unable to find entry for player:', key, convertedId, altConvertedId);
      }
    }
  }
  return obj;
};

// Update mapping from Steam64ID to DiscordId
export const playerMapSteamIdStats = (gameObject: Game, stats) => {
  let obj;
  for (let i = 0; i < 1; i++) { // Should only be 1 map for now
    const tempMap = {
      team1: undefined,
      team2: undefined
    };
    const map = stats[`map${i}`];
    if (map) {
      const t1 = map.team1;
      const t2 = map.team2;
      const team1Players = gameObject.getBalanceInfo().team1;
      const team2Players = gameObject.getBalanceInfo().team2;
      tempMap.team1 = remapTeam(team1Players, t1);
      tempMap.team2 = remapTeam(team2Players, t2);
      obj = tempMap; // ['map' + i]
    }
  }
  // Update Mapping from Steam2ID -> Players To Steam64Id Players
  return obj;
};

const setResults = (gameObject: Game, stats) => {
  const winnerTeam = stats.map0.winner;
  const winner = winnerTeam === 'team1' ? 1 : (winnerTeam === 'team2' ? 2 : '');
  // console.log('@setResults DEBUG:', winnerTeam, '"' + winner + '"');
  const playerMappedStats = playerMapSteamIdStats(gameObject, stats);
  if (!gameObject.getChosenMap()) {
    gameObject.setChosenMap(stats.map0.mapname);
  }
  gameObject.setScoreString(`${stats.map0.team1.score}-${stats.map0.team2.score}`);
  if (winner !== '' && samePlayersInTeams(gameObject, stats)) {
    console.log('@getGameStatsDiscord Winning team:', winnerTeam, gameObject.getScoreString(), gameObject.getChosenMap());
    updateMMR(winner, gameObject, (message) => {
      console.log('DEBUG @callbackGameFinished - Calls on exit after delete on this message');
      f.deleteDiscMessage(message, f.getDefaultRemoveTime() * 4, 'gameFinished');
      cleanOnGameEnd(gameObject);
    }, playerMappedStats);
  } else {
    console.log('Missing Winner - Incomplete Results', winner, samePlayersInTeams(gameObject, stats));
  }
};

const getGameStatsDiscord = (gameObject: Game, stats) => {
  // Check which team that won and update MMR accordingly
  setResults(gameObject, stats);

  const discordMessage = buildStatsMessage(stats);
  if (discordMessage) {
    // Visualize stats in discord message
    sendStatsDiscord(gameObject, discordMessage);
  }
};

/*
const getCsStats = (uid) => {
    SELECT name, ROUND(GROUP_CONCAT(headshot_kills / kills), 2), AVG(5kill_rounds), AVG(4kill_rounds), ROUND(AVG(3kill_rounds)),
    ROUND(AVG(2kill_rounds)), ROUND(AVG(1kill_rounds)), AVG(kills), AVG(deaths), AVG(assists), ROUND(AVG(damage)), AVG(flashbang_assists),
    GROUP_CONCAT(mid) FROM CSPlayerStats WHERE name IN ("Petter", "Weeb as Fuck", "Lacktjo", "Ahoy!") GROUP BY name ORDER BY kills DESC;

    SELECT name,
    ROUND(AVG(kills), 2) AS Kills, ROUND(AVG(deaths), 2) AS Deaths, ROUND(AVG(assists), 2) AS Assists,
    ROUND(GROUP_CONCAT(headshot_kills / kills), 2) AS HS,
    AVG(ROUND(damage / roundsplayed)) AS ADR,
    SUM(flashbang_assists) AS FA,
    ROUND(AVG(IFNULL(firstkill_t, 0)), 2) AS TKills,
    ROUND(AVG(IFNULL(firstdeath_t, 0)), 2) AS TDeaths,
    ROUND(AVG(IFNULL(firstkill_ct, 0)), 2) AS CTKills,
    ROUND(AVG(IFNULL(firstdeath_ct, 0)), 2) AS CTDeaths,
    SUM(5kill_rounds) AS 5k, SUM(4kill_rounds) AS 4k, SUM(3kill_rounds) AS 3k,
    ROUND(AVG(tradekill), 2) AS Trades,
    ROUND(AVG(bomb_plants), 1) AS Plants, ROUND(AVG(bomb_defuses), 1) AS Defuses,
    GROUP_CONCAT(mid) AS MatchID
    FROM CSPlayerStats
    GROUP BY uid ORDER BY kills DESC;

    SUM(2kill_rounds) AS 2k,
    ROUND(AVG(1kill_rounds)) AS 1k,
    AVG(IFNULL(firstkill_t, 0) / (IFNULL(firstkill_t, 0) + IFNULL(firstdeath_t, 0))) AS T,
    AVG(firstkill_ct / (firstkill_ct + firstdeath_ct)) AS CT,
    WHERE name IN ("Petter", "Weeb as Fuck", "Lacktjo", "Ahoy!")
    WHERE uid in (?)
  };
*/

export const getGameStats = async (serverId, gameObject) => {
  // writeConsole(serverId, 'get5_dumpstats');

  // Get match id
  const matchId = gameObject.getMatchId();
  const statsFile = await fetchStatsFile(serverId, matchId);
  if (statsFile.data && statsFile.statusCode >= 200 && statsFile.statusCode < 400) {
    console.log('@getGameStats Raw:', statsFile);
    const data = vdf.parse(statsFile.data);
    console.log(data);
    console.log(data.Stats.map0);
    getGameStatsDiscord(gameObject, data.Stats);
    cleanStatsFile();
  }
};
