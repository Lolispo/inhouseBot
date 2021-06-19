
// Author: Petter Andersson and Robert Wörlund

import { printMessage } from '../bot';
import { createMatch, updateDbMMR } from '../database/db_sequelize';
import { Game } from './game';

/*
	Handles MMR calculations and updates
	Uses db_sequelize to update mmr for all the players
	Uses bot to return the updated mmr to the disc clients
*/

// Update mmr for all players and returns result to clients
export const updateMMR = (winner: number, gameObject: Game, callbackUpdate: Function, stats?) => { // winner = 0 -> draw, 1 -> team 1, 2 -> team 2
  const balanceInfo = gameObject.getBalanceInfo();
  const mmrChange = eloUpdate(balanceInfo.avgT1, balanceInfo.avgT2, winner);
  updateTeamMMR(balanceInfo.team1, mmrChange.t1, balanceInfo.game, winner === 1);
  updateTeamMMR(balanceInfo.team2, mmrChange.t2, balanceInfo.game, winner === 2);

  createMatch(winner, balanceInfo, {
    t1: mmrChange.t1,
    t2: mmrChange.t2,
  }, gameObject.getChosenMap(), gameObject.getScoreString(), stats);
  buildMMRUpdateString(winner, callbackResult, balanceInfo, callbackUpdate, gameObject);
};

// Calculates the mmr change for two teams with given average team mmr and winner
export const eloUpdate = (t1mmr, t2mmr, winner) => {
  const K = 50;
  // transformed ratings for t1 and t2
  const t1_trans = Math.pow(10, t1mmr / 400);
  const t2_trans = Math.pow(10, t2mmr / 400);

  // estimated ratings for t1 and t2
  const est1 = t1_trans / (t1_trans + t2_trans);
  const est2 = t2_trans / (t1_trans + t2_trans);

  // actual score of winner
  let score1 = 0;
  let score2 = 0;

  switch (winner) {
    case 1:
      score1 = 1;
      break;
    case 2:
      score2 = 1;
      break;
    default:
      // draw
      score1 = 0.5;
      score2 = 0.5;
  }

  // new mmr for t1 and t2
  const t1_new = t1mmr + K * (score1 - est1);
  const t2_new = t2mmr + K * (score2 - est2);

  // console.log('DEBUG: @eloupdate, ', t1_new, t1mmr, Math.round(t1_new), Math.round(t1_new)-t1mmr, Math.round(t1_new-t1mmr));

  return { // Changed to round everything since t1mmr are averages and can be doubles
    t1: Math.round(t1_new - t1mmr),
    t2: Math.round(t2_new - t2mmr),
  };
}

// Update team mmr for the given team locally and in database
function updateTeamMMR(team, change, game, winner) {
  for (let i = 0; i < team.length; i++) {
    const newMMR = team[i].getMMR(game) + change;
    team[i].setMMRChange(game, change);
    team[i].setMMR(game, newMMR);
    team[i].setPlusMinus(game, (change > 0 ? '+' : ''));
    updateDbMMR(team[i].uid, newMMR, game, winner);
  }
}

// After a finished game, prints out new updated mmr
// TODO: Print``
function buildMMRUpdateString(winningTeam, callback, balanceInfo, callbackUpdate, gameObject) {
  const {
    team1, team2, game, team1Name, team2Name,
  } = balanceInfo;
  const winningTeamMessage = `**${winningTeam === 1 ? `${team1Name} won!` : (winningTeam === 2 ? `${team2Name} won!` : 'Tie!')}**`;
  let s = '';
  s += `${winningTeamMessage} Played game: **${game}**. Updated mmr is: \n`;
  s += `**${team1Name}**: \n\t*${team1[0].userName} (${team1[0].getMMR(game)} mmr, ${team1[0].getGame(game).prevMMR} ${team1[0].getGame(game).latestUpdatePrefix}${team1[0].getGame(game).latestUpdate})`;
  for (let i = 1; i < team1.length; i++) {
    s += `\n\t${team1[i].userName} (${team1[i].getMMR(game)} mmr, ${team1[i].getGame(game).prevMMR} ${team1[i].getGame(game).latestUpdatePrefix}${team1[i].getGame(game).latestUpdate})`;
  }
  s += '*\n';
  s += `**${team2Name}**: \n\t*${team2[0].userName} (${team2[0].getMMR(game)} mmr, ${team2[0].getGame(game).prevMMR} ${team2[0].getGame(game).latestUpdatePrefix}${team2[0].getGame(game).latestUpdate})`;
  for (let i = 1; i < team2.length; i++) {
    s += `\n\t${team2[i].userName} (${team2[i].getMMR(game)} mmr, ${team2[i].getGame(game).prevMMR} ${team2[i].getGame(game).latestUpdatePrefix}${team2[i].getGame(game).latestUpdate})`;
  }
  s += '*\n';
  callback(gameObject, s, callbackUpdate);
}

function callbackResult(gameObject, message, callback) {
  // TODO Game: Get Game instead, have printMessage
  printMessage(message, gameObject.getChannelMessage(), callback);
}
