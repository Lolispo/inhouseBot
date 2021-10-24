	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
/*
SELECT mid, team1Name, team2Name FROM matches ORDER BY mid DESC LIMIT 5;

INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "4 Elephants and edgy Cheesedad", "5 Tiny Hot Men", NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("cs", "2", "The Spawn Camping Villians", "Petter's B-site Rushers", NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "2", "Petter's 1337 H4xx0rz", "Knas's Helicopters", NOW(), NOW());
*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "Team 1", "Team 2", NOW(), NOW());
/*
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;

*/

/* MID */
SELECT * FROM matches ORDER BY mid DESC LIMIT 1;
302
/* Players */

SELECT users.uid, users.userName, ratings.mmr FROM users LEFT JOIN ratings ON users.uid = ratings.uid WHERE gameName = "dota" ORDER BY mmr DESC;


/* Create player matches */
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (mid, uid, ?, +-25);
/*
OLD: INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
*/
/* Update rating */ 
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "96324164301910016", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "117379657719873536", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "218695120848027648", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "303257343746113547", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "117458165192327173", 1, 25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "117037153950760963", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "117376140506693639", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "252531109491900417", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "112632032172994560", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (302, "97026023387848704", 2, -25);

/*
DELETE FROM playerMatches WHERE mid = 180;
*/

UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 


*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 


UPDATE ratings SET mmr = "2400", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96324164301910016" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "117379657719873536" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2525", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "218695120848027648" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2525", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "303257343746113547" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2525", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "117458165192327173" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1 WHERE uid = "117037153950760963" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2525", gamesPlayed = gamesPlayed + 1 WHERE uid = "117376140506693639" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1 WHERE uid = "252531109491900417" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1 WHERE uid = "112632032172994560" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2425", gamesPlayed = gamesPlayed + 1 WHERE uid = "97026023387848704" AND gameName = "dota"; 

/*
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
