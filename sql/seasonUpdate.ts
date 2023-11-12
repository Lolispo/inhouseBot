import { getTruncatedRating } from "../src/database/reset_season";
// import { season1Mmr } from './seasonReset/seasonResults'; 
import { season2Mmr } from './seasonReset/seasonResults'; 

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
  const seasonNumber = 2;
  console.log(`@Season ${seasonNumber} Ratings: ${listOfPlayers}`);
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

// seasonTruncate(season1Mmr);
seasonTruncate(season2Mmr);