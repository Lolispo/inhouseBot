/*
To get output to CSV format:
    " +\| "			Replace with ", "
    " +\|\s*\| "	Replace with \n
    Start and end fix

*/

import { getTruncatedRating } from "../../database/reset_season";
import { season1Mmr } from "./input"

const translateToSQLCommand = (list) => {
  return list.map((player: SqlPlayer) => {
    return {
      ...player,
      sql: `UPDATE ratings SET mmr = "${player.mmr}" WHERE uid = "${player.uid}" AND gameName = "${player.gameName}";`
    }
  })
}

interface SqlPlayer {
  mmr: number;
  uid: string;
  gameName: string;
  userName: string;
  prevMmr?: number;
}

const seasonTruncate = (listOfPlayers: SqlPlayer[]) => {
  console.log('@Season 1 Ratings:', listOfPlayers);
  const result = [];
  listOfPlayers.map(player => {
    const newMmr = getTruncatedRating(player.mmr);
    console.log(`Current ${player.mmr}, new: ${newMmr} ${player.userName} ${player.uid} ${player.gameName}`);
    result.push({ ...player, mmr: newMmr, prevMmr: player.mmr });
  })
  const sqlResult = translateToSQLCommand(result);
  sqlResult.map(sqlRow => console.log(`${sqlRow.userName}: Game: ${sqlRow.gameName} New: ${sqlRow.mmr}, prevMmr: ${sqlRow.prevMmr}`));
  console.log(' --------------------SQL LINES --------------------')
  sqlResult.map(sqlRow => console.log(`${sqlRow.sql}`));
}

seasonTruncate(season1Mmr.list);