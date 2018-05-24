use pettea;

/* Clear database entries */

/* DELETE FROM users; */

UPDATE users SET mmr = 2500, gamesPlayed = 0;
/* Remove irrelavant discord users from default standings*/
UPDATE users SET mmr = 1500 WHERE userName = "Rhytm";
UPDATE users SET mmr = 1500 WHERE userName = "Player 0";
UPDATE users SET mmr = 1500 WHERE userName = "Player 1";
UPDATE users SET mmr = 1500 WHERE userName = "Player 2";
UPDATE users SET mmr = 1500 WHERE userName = "Player 3";
UPDATE users SET mmr = 1500 WHERE userName = "Player 4";
UPDATE users SET mmr = 1500 WHERE userName = "Player 5";
UPDATE users SET mmr = 1500 WHERE userName = "Player 6";
UPDATE users SET mmr = 1500 WHERE userName = "Player 7";
UPDATE users SET mmr = 1500 WHERE userName = "Player 8";
UPDATE users SET mmr = 1500 WHERE userName = "Player 9";
