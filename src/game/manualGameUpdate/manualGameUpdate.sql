	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
/*
SELECT mid FROM matches ORDER BY mid DESC LIMIT 5;


INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "Banza1's Princesses", "4 Pepegas and edgy Knas", NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("cs", "2", "The Spawn Camping Villians", "Petter's B-site Rushers", NOW(), NOW());

INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "The Confused Coconuts", "5 Tiny Ducks", NOW(), NOW());
*/

/*
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;
*/

/* MID */
SELECT * FROM matches ORDER BY mid DESC LIMIT 1;
118
/* Players */

SELECT users.uid, users.userName, ratings.mmr FROM users LEFT JOIN ratings ON users.uid = ratings.uid WHERE gameName = "dota" ORDER BY mmr DESC;





/* Create player matches */
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (mid, uid, ?, +-25);
/*
OLD: INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
*/
/* Update rating */ 
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "107205764044599296", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "96293765001519104", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "96324164301910016", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "150517088295976960", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "252531109491900417", 1, 25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "149244631010377728", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "97026023387848704", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "118012070049349632", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "96306231043432448", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (118, "356184240859250698", 2, -25);

+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2725 |
| 96293765001519104  | Petter            | 2625 |
| 96324164301910016  | Simon             | 2475 |
| 150517088295976960 | CATKNIFE          | 2475 |
| 252531109491900417 | Banza1            | 2300 |
|--------------------+-------------------+------+
| 149244631010377728 | Knas              | 2725 |
| 97026023387848704  | Cheesedad         | 2600 |
| 118012070049349632 | Jotunheim         | 2500 |
| 96306231043432448  | Lacktjo           | 2500 |
| 356184240859250698 | ErjanDaMan        | 2275 |
+--------------------+-------------------+------+


UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 


*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 


+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2725 |
| 96293765001519104  | Petter            | 2625 |
| 96324164301910016  | Simon             | 2475 |
| 150517088295976960 | CATKNIFE          | 2475 |
| 252531109491900417 | Banza1            | 2300 |
|--------------------+-------------------+------+
| 149244631010377728 | Knas              | 2725 |
| 97026023387848704  | Cheesedad         | 2600 |
| 118012070049349632 | Jotunheim         | 2500 |
| 96306231043432448  | Lacktjo           | 2500 |
| 356184240859250698 | ErjanDaMan        | 2275 |

UPDATE ratings SET mmr = "2750", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "107205764044599296" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96293765001519104" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2500", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96324164301910016" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2500", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "150517088295976960" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2325", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "252531109491900417" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2700", gamesPlayed = gamesPlayed + 1 WHERE uid = "149244631010377728" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2575", gamesPlayed = gamesPlayed + 1 WHERE uid = "97026023387848704" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1 WHERE uid = "118012070049349632" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1 WHERE uid = "96306231043432448" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2250", gamesPlayed = gamesPlayed + 1 WHERE uid = "356184240859250698" AND gameName = "dota"; 
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
