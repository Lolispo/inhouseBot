use pettea;

/*
	Author: Petter Andersson
	Clear database entries 
*/

/* DELETE FROM users; */

/*UPDATE users SET cs = mmr, cs1v1 = 2500, dota = 2500, dota1v1 = 2500, trivia = 0;*/
/*UPDATE users SET cs = 2500, cs1v1 = 2500, dota = 2500, dota1v1 = 2500, trivia = 0, gamesPlayed = 0;*/

UPDATE users SET cs = 2500, gamesPlayed = 0;
/* Remove irrelavant discord users from default standings*/
UPDATE users SET cs = 1500 WHERE userName = "Rhytm";
UPDATE users SET cs = 1500 WHERE userName = "Player 0";
UPDATE users SET cs = 1500 WHERE userName = "Player 1";
UPDATE users SET cs = 1500 WHERE userName = "Player 2";
UPDATE users SET cs = 1500 WHERE userName = "Player 3";
UPDATE users SET cs = 1500 WHERE userName = "Player 4";
UPDATE users SET cs = 1500 WHERE userName = "Player 5";
UPDATE users SET cs = 1500 WHERE userName = "Player 6";
UPDATE users SET cs = 1500 WHERE userName = "Player 7";
UPDATE users SET cs = 1500 WHERE userName = "Player 8";
UPDATE users SET cs = 1500 WHERE userName = "Player 9";
