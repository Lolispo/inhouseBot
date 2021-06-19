
// Author: Petter Andersson

import * as f from '../tools/f';

import { printMessage } from '../bot';
import { getTeamName } from '../teamNames';
import { configureServer } from '../csserver/cs_server';
import { getCsIp, getCsUrl } from '../csserver/server_info';
import { checkMissingSteamIds, notifyPlayersMissingSteamId } from '../steamid';
import { Game, IBalanceInfo } from './game';
import { ConnectDotaAction } from '../commands/game/dota';
import { Player, sortRating } from './player';
import { gameIsCS, gameIsCSMain, gameIsDota, gameIsTest } from './gameModes';

/*
	Handles getting the most balanced team matchup for the given 10 players
	Uses bot to return the teams to the discord clients

	Since currently only mmr is needed, to algorithm could be simplified as placing players in different sorted by highest mmr, same result
	Current implementation support addition of other factors, language support/known players etc
	TODO: Check if this would work if restrictions for team sizes are removed, generateTeamCombs changes required
*/

interface EmbeddedMessage { // TODO: Refine
  content: any,
  embed: any,
  files?: any;
}

interface ReturnMessage {
  message: string | EmbeddedMessage,
  balanceInfo: IBalanceInfo
}

// @param players should contain Array of initialized Players of people playing
export const balanceTeams = (players: Player[], game: string, gameObject: Game, skipServer = false) => {
  // Generate team combs, all possibilities of the 10 players
  const teamCombs = generateTeamCombs(players);
  const result = findBestTeamComb(players, teamCombs, game);

  // Take original mmr values from sort function


  // Return string to message to clients
  let message: string | EmbeddedMessage;
  let balanceInfo: IBalanceInfo;

  console.log('@Starting Game:', JSON.stringify(result, null, 2));
  let object: ReturnMessage;
  try {
    object = buildReturnStringEmbed(result);
    console.log('Embedded message successfully:', message);
  } catch (e) {
    console.error('Embed failed', e);
    object = buildReturnString(result);
  }
  message = object.message;
  balanceInfo = object.balanceInfo;
  gameObject.setBalanceInfo(balanceInfo);

  printMessage(message, gameObject.getChannelMessage(), (message) => {
    gameObject.setMatchupServerMessage(message);
  });

  // TODO: Only if no other active games using server
  if (gameIsCS(game) && !skipServer) {
    const playersMissingSteamIds = checkMissingSteamIds(players);
    // console.log('Check missing steam ids:', players, players.map(player => player.getSteamId()).join(", "), playersMissingSteamIds.map(player => player.getSteamId()).join(", "));
    if (playersMissingSteamIds.length > 0) {
      // People are missing steamids
      notifyPlayersMissingSteamId(playersMissingSteamIds);
      const playersString = playersMissingSteamIds.map(player => player.userName).join(', ');
      printMessage(`Note: Missing SteamIds for: ${playersString}`, gameObject.getChannelMessage(), (messageParam) => {
        f.deleteDiscMessage(messageParam, 120000, 'missingSteamIds');
      });
    }
    configureServer(gameObject);
  } else if ((gameIsDota(game) || gameIsTest(game)) && !skipServer) {
    const playersMissingSteamIds = checkMissingSteamIds(players);
    // console.log('Check missing steam ids:', players, players.map(player => player.getSteamId()).join(", "), playersMissingSteamIds.map(player => player.getSteamId()).join(", "));
    if (playersMissingSteamIds.length > 0) {
      // People are missing steamids
      notifyPlayersMissingSteamId(playersMissingSteamIds);
      const playersString = playersMissingSteamIds.map(player => player.userName).join(', ');
      printMessage(`Note: Missing SteamIds for: ${playersString}`, gameObject.getChannelMessage(), (messageParam) => {
        f.deleteDiscMessage(messageParam, 120000, 'missingSteamIds');
      });
    }
    ConnectDotaAction.startMatch(gameObject.gameID, [gameObject.getBalanceInfo().team1, gameObject.getBalanceInfo().team2]);
  }
};

// Generates the combinations for different team sizes
// uniqueCombs makes sure that duplicates aren't saved
// @return teamCombs is returned with all possible matchups
const generateTeamCombs = (players: Player[]): number[][] => {
  // console.log('DEBUG: @generateTeamCombs');
  const teamCombs = []; // Saves all team combination, as arrays of indexes of one team (other team is implied)
  const uniqueCombs = new Set(); // A number combination for each comb, to prevent saving duplicates.
  const len = players.length;
  if (len === 2) {
    teamCombs.push([0]); // Only one team exist, its one player
    return teamCombs;
  }

  recursiveFor(0, [], len, 0, teamCombs, uniqueCombs);

  // console.log('DEBUG: @generateTeamCombs, teamCombs = ', teamCombs, teamCombs.length, uniqueCombs, uniqueCombs.size);
  return teamCombs;
}

// Fills teamCombs with the teamcombination given amount of players
export const recursiveFor = (startIndex, indexes, len, forloopindex, teamCombs, uniqueCombs) => {
  for (let i = startIndex; i < len; i++) {
    const indexesArray = indexes.slice(); // Copy of array
    if (forloopindex < len / 2) {
      indexesArray.push(i);	// Add current index to indexes
      recursiveFor(i + 1, indexesArray, len, forloopindex + 1, teamCombs, uniqueCombs);
    } else {
      combinationAdder(teamCombs, uniqueCombs, indexesArray);
    }
  }
}

// Store combinations for the given player indexes (players) and stores it in teamcombs
// uniqueCombs holds a number that represent equal combinations of players, as well as their reverseComb
export const combinationAdder = (teamCombs, uniqueCombs, players: number[]): void => {
  const adder = (accumulator, currentValue) => accumulator + currentValue;
  const uniqueSum = players.map(uniVal).reduce(adder); // Sum over uniVal for each player index, creating unique sum
  if (!uniqueCombs.has(uniqueSum)) {
    const teamComb = players;
    teamCombs.push(teamComb); // Add new combination to teamCombs
    uniqueCombs.add(uniqueSum);
    uniqueCombs.add(reverseUniqueSum(players, players.length * 2)); // Removes so [0,1,2,3,4] is the same as [5,6,7,8,9]
  }
}

// Unique number combinations for combinations of 5.
// Should give (check): 0: 0, 1: 10, 2: 200, 3: 3000, 4: 40000, 5: 5, 6: 60, 7: 700, 8: 8000; 9: 90000
export const uniVal = (x: number): number => {
  return (x * Math.pow(10, (x % 5)));
}

// Fixar så [0,1,2,3,4] combos = [5,6,7,8,9] combos, no duplicates for them
export const reverseUniqueSum = (list: number[], len: number): number => {
  // console.log('DEBUG: @reverseUniqueSum', list, len);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const found = list.some(el => el === i);
    if (!found) {
      sum += uniVal(i);
    }
  }
  return sum;
}

// Compare elo matchup between teamCombinations, lowest difference wins
const findBestTeamComb = (players: Player[], teamCombs: number[][], game: string): IBalanceInfo => {
  let bestPossibleTeamComb = Number.MAX_VALUE;
  let t1 = [];
  let t2 = [];
  let multiple_t1 = [];
  let multiple_t2 = [];
  let avgTeam1 = -1;
  let avgTeam2 = -1;
  for (let i = 0; i < teamCombs.length; i++) {
    const teams = getBothTeams(teamCombs[i], players);
    const res = mmrCompare(teams.t1, teams.t2, game);
    if (res.diff < bestPossibleTeamComb) {
      bestPossibleTeamComb = res.diff;
      avgTeam1 = res.avgT1;
      avgTeam2 = res.avgT2;
      t1 = teams.t1;
      t2 = teams.t2;
      multiple_t1 = [t1];
      multiple_t2 = [t2];
    } else if (res.diff === bestPossibleTeamComb) { // Random aspect between combinations when combinations have same result
      // Should contain same avg rating
      multiple_t1.push(teams.t1);
      multiple_t2.push(teams.t2);
    }
  }

  // Random from equal
  if (multiple_t1.length > 1 && multiple_t2.length > 1) {
    const index = Math.floor(Math.random() * multiple_t1.length); // Random index chosen as teamcombination from equal ones
    t1 = multiple_t1[index];
    t2 = multiple_t2[index];
  }

  // Sort based on MMR Descending
  t1 = sortRating(t1, game);
  t2 = sortRating(t2, game);

  // Retrieved most fair teamComb
  return {
    team1: t1, team2: t2, difference: bestPossibleTeamComb, avgT1: avgTeam1, avgT2: avgTeam2, avgDiff: Math.abs(avgTeam1 - avgTeam2), game,
  };
}

// Get the two teams of players from the teamComb
const getBothTeams = (teamComb: number[], players: Player[]): { t1: Player[], t2: Player[] } => {
  const team1 = [];
  const team2 = [];
  for (let i = 0; i < players.length; i++) { // Iterates over players and adds to each team
    if (teamComb.includes(i)) {
      team1.push(players[i]);
    } else {
      team2.push(players[i]);
    }
  }
  // console.log('DEBUG: @getBothTeams, team1 = ', team1, '\nteam2 = ', team2, 'teamComb', teamComb);
  return { t1: team1, t2: team2 };
}

export const testNormalize = (mmr) => {
  const x = 1.5;
  const y = 10;
  const startMmr = 2500;
  if (mmr > startMmr) {
    mmr = startMmr - (((mmr - startMmr)/(mmr - startMmr)^x) * y);
  } else if (mmr < startMmr) {
    mmr = startMmr - (((startMmr - mmr)/(startMmr - mmr)^x) * y);
  }
  return mmr;  
}

/**
 * Normalize MMR when summing to make it simpler
 * @param mmr 
 */
const normalizeMmr = (mmr) => {
  const upperLimit = 2700;
  const lowerLimit = 2300;
  const startMmr = 2500;
  if (mmr > upperLimit) {
    mmr = ((mmr - upperLimit) / 2) + upperLimit;
  } else if (mmr < lowerLimit) {
    mmr = ((mmr - lowerLimit) / 2) + lowerLimit;
  }
  // TODO: Verify the teams BETA
  return mmr;
}

// @param two teams of players
// @return total mmr difference
function mmrCompare(t1, t2, game) {
  const avgTeam1 = addTeamMMR(t1, game);
  const avgTeam2 = addTeamMMR(t2, game);
  const difference = Math.abs(avgTeam1 - avgTeam2);
  return { diff: difference, avgT1: (avgTeam1 / t1.length), avgT2: (avgTeam2 / t2.length) };
}

function addTeamMMR(team, game) { // Function to be used in summing over players
  let sum = 0;
  for (let i = 0; i < team.length; i++) {
    const mmr = team[i].getMMR(game);
    const normalizedMmr = normalizeMmr(mmr);
    sum += normalizedMmr;
  }
  // console.log('DEBUG: @addTeamMMR, team = ', team, 'TeamMMR:', sum);
  // TODO: return normalize values aswell?
  return sum;
}

/**
 * Prettify the number output
 * Whole integer if integer
 * Otherwise float with 2 values
 * @param num 
 * @returns the prettified number
 */
export const roundValue = (num) => {
  // console.log('@roundValue:', num);
  if (num % 1 === 0) return num;
  return parseFloat(num).toFixed(2);
};

const buildReturnStringEmbed = (obj: IBalanceInfo): ReturnMessage => {
  let title = `**New Game!** Playing **${obj.game}**. `;
  if (obj.team1.length === 1) { // No average for 2 player matchup
    title += `MMR diff: ${obj.difference} mmr`;
  } else {
    title += `MMR Avg diff: ${roundValue(obj.avgDiff)} mmr (Total: ${obj.difference} mmr)`;
  }

  let s = '';
  let gif;
  const fields = [];
  // console.log('@buildReturnString', obj)

  const team1Name = getTeamName(obj.team1, obj.game) || 'Team 1';
  const team2Name = getTeamName(obj.team2, obj.game) || 'Team 2';
  obj.team1Name = team1Name;
  obj.team2Name = team2Name;
  const teamCT = (gameIsCSMain(obj.game) ? '**(CT)**' : '');
  const teamT = (gameIsCSMain(obj.game) ? '**(T)**' : '');
  // s +=
  let name = `**${team1Name}** ${teamCT}\t(Avg: ${roundValue(obj.avgT1)} mmr): `;
  let value = `*${obj.team1[0].userName} (${obj.team1[0].getMMR(obj.game)})*`;
  for (let i = 1; i < obj.team1.length; i++) {
    value += `,\t*${obj.team1[i].userName} (${obj.team1[i].getMMR(obj.game)})*`;
  }
  // value += '*';
  fields.push({ name, value });
  // s += '*\n';
  name = `**${team2Name}** ${teamT}\t(Avg: ${roundValue(obj.avgT2)} mmr): `;
  value = `*${obj.team2[0].userName} (${obj.team2[0].getMMR(obj.game)})*`;
  for (let i = 1; i < obj.team2.length; i++) {
    value += `,\t*${obj.team2[i].userName} (${obj.team2[i].getMMR(obj.game)})*`;
  }
  // value += '*';
  fields.push({ name, value });
  // s += '*\n\n';
  const isCs = gameIsCS(obj.game);
  if (isCs) {
    // s += '*Connect:* \n';
    s += `Link: ${getCsUrl()}`; // TODO: Embedded links or something [Named Link](<link>) (Steam link no work)
    s += `\n**${getCsIp()}**`;
  } else if (gameIsDota(obj.game)) {
    const gifLink = 'res/dotaConnect.gif';
    gif = [{
      attachment: gifLink,
      name: 'DotaConnect.gif',
    }];
    s += 'Lobby Name: Dank\nPassword: 123';
  }
  const messageEmbedded: EmbeddedMessage = {
    // content: title,
    content: '',
    // TODO: Check embeds instead of embed
    embed: {
      title,
      ...(isCs ? { description: s } : { footer: { text: s } }),
      fields,
      color: 0x251ac1,
      ...(gif && { image: { url: `attachment://${gif[0].name}` } }),
    },
    ...(gif && { files: gif }),
  };

  return { message: messageEmbedded, balanceInfo: obj };
};

// Build a string to return to print as message
const buildReturnString = (obj: IBalanceInfo): ReturnMessage => { // TODO: Print``
  let s = '';
  // console.log('@buildReturnString', obj)
  s += `**New Game!** Playing **${obj.game}**. `;
  if (obj.team1.length === 1) { // No average for 2 player matchup
    s += `MMR diff: ${obj.difference} mmr. `;
  } else {
    s += `MMR Avg diff: ${roundValue(obj.avgDiff)} mmr (Total: ${obj.difference} mmr). `;
  }
  s += '\n';
  const team1Name = getTeamName(obj.team1, obj.game) || 'Team 1';
  const team2Name = getTeamName(obj.team2, obj.game) || 'Team 2';
  obj.team1Name = team1Name;
  obj.team2Name = team2Name;
  const teamCT = (gameIsCSMain(obj.game) ? '**(CT)**' : '');
  const teamT = (gameIsCSMain(obj.game) ? '**(T)**' : '');
  s += `**${team1Name}** ${teamCT}\t(Avg: ${roundValue(obj.avgT1)} mmr): \n*${obj.team1[0].userName} (${obj.team1[0].getMMR(obj.game)})`;
  for (let i = 1; i < obj.team1.length; i++) {
    s += `,\t${obj.team1[i].userName} (${obj.team1[i].getMMR(obj.game)})`;
  }
  s += '*\n';
  s += `**${team2Name}** ${teamT}\t(Avg: ${roundValue(obj.avgT2)} mmr): \n*${obj.team2[0].userName} (${obj.team2[0].getMMR(obj.game)})`;
  for (let i = 1; i < obj.team2.length; i++) {
    s += `,\t${obj.team2[i].userName} (${obj.team2[i].getMMR(obj.game)})`;
  }
  s += '*\n\n';
  if (gameIsCS(obj.game)) {
    s += `*Connect:* \n**${getCsIp()}**`;
  } else if (gameIsDota(obj.game)) {
    // TODO Embed
  }
  return { message: s, balanceInfo: obj };
};
