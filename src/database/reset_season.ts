import { truncateRating } from "./db_sequelize";


// Truncate Rating
export const seasonResetTeamRating = (listOfPlayers, game) => {
  for (let i = 0; i < listOfPlayers.length; i++) {
    const player = listOfPlayers[i];
    const playerMmr = 'TEMP'; // TODO .getMMR(game)
    const newMMR = getTruncatedRating(playerMmr);
    truncateRating(listOfPlayers[i].uid, newMMR, game);
  }
};

/**
 * Given a rating, truncate it closer to 2500
 * Requires Tests
 */
const getTruncatedRating = (rating) => {
  const defaultRating = 2500; // Check if it should be fetched somewhere else TODO
  const diff = rating - 2500;
  const newRating = 2500 + Math.round(diff / 2.0);
  console.log('@getTruncatedRating:', rating, newRating);
  return newRating;
  // Test cases:
  // 2650 -> 2575
  // 2325 -> 2413
};
