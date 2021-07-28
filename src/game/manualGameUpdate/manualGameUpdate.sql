	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
/*
SELECT mid, team1Name, team2Name FROM matches ORDER BY mid DESC LIMIT 5;

INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "5 Adorable Alpacas", "5 Edgy Pool Noodles", NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("cs", "2", "The Spawn Camping Villians", "Petter's B-site Rushers", NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "2", "Petter's 1337 H4xx0rz", "Knas's Helicopters", NOW(), NOW());
*/

/*
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;

*/

/* MID */
SELECT * FROM matches ORDER BY mid DESC LIMIT 1;

/* Players */

SELECT users.uid, users.userName, ratings.mmr FROM users LEFT JOIN ratings ON users.uid = ratings.uid WHERE gameName = "dota" ORDER BY mmr DESC;




/* Create player matches */
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (mid, uid, ?, +-25);
/*
OLD: INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
*/
/* Update rating */ 
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "96293765001519104", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "150517088295976960", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "135406982977814528", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "97026023387848704", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "209047905909080065", 1, -25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "149535388434694144", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "149244631010377728", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "192689639725858816", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "96941150824329216", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (216, "149835181149257728", 2, 25);

/*
DELETE FROM playerMatches WHERE mid = 180;
*/

UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 


*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 



UPDATE ratings SET mmr = "2999", gamesPlayed = gamesPlayed + 1 WHERE uid = "96293765001519104" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2701", gamesPlayed = gamesPlayed + 1 WHERE uid = "150517088295976960" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2425", gamesPlayed = gamesPlayed + 1 WHERE uid = "135406982977814528" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2400", gamesPlayed = gamesPlayed + 1 WHERE uid = "97026023387848704" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2299", gamesPlayed = gamesPlayed + 1 WHERE uid = "209047905909080065" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2400", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "149535388434694144" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2724", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "149244631010377728" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2700", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "192689639725858816" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2525", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96941150824329216" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "149835181149257728" AND gameName = "dota"; 

/*
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
