import { truncateRating } from "./db_sequelize";


// Truncate Rating
export const seasonResetTeamRating = (listOfPlayers, game) => {
  for (let i = 0; i < listOfPlayers.length; i++) {
    const player = listOfPlayers[i];
    const playerMmr = 'TEMP'; // TODO .getMMR(game)
    const newMMR = getTruncatedRating(playerMmr);
    truncateRating(player.uid, newMMR, game);
  }
};

/**
 * Given a rating, truncate it closer to 2500
 */
export const getTruncatedRating = (rating) => {
  const defaultRating = 2500; // Check if it should be fetched somewhere else TODO
  const diff = rating - defaultRating;
  const truncatedRating = defaultRating + Math.round(diff / 2.0);
  const diffNormalization = truncatedRating % 25;
  if (truncatedRating < defaultRating && diffNormalization > 0) {
    console.log('@getTruncatedRating:', rating, diffNormalization, truncatedRating, truncatedRating - diffNormalization + 25);
    return truncatedRating - diffNormalization + 25;
  } else {
    console.log('@getTruncatedRating:', rating, diffNormalization, truncatedRating, truncatedRating - diffNormalization);
    return truncatedRating - diffNormalization;
  }
};
