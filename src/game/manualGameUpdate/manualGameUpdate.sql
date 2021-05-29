	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
/*
OLD: INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "5 Edgy Doggos", "4 Coconuts and confused Jimi", NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("cs", "2", "The Spawn Camping Villians", "Petter's B-site Rushers", NOW(), NOW());

*/

INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "The Confused Coconuts", "5 Tiny Ducks", NOW(), NOW());
/*
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;
*/

/* MID */
SELECT * FROM matches ORDER BY mid DESC LIMIT 1;
112
/* Players */

SELECT users.uid, users.userName, ratings.mmr FROM users LEFT JOIN ratings ON users.uid = ratings.uid WHERE gameName = "cs";
/*
| 149244631010377728 | Knas              | 2549 |
| 97026023387848704  | Cheesedad         | 2500 |
| 96324164301910016  | Simon             | 2350 |
+--------------------+-------------------+------+
| 140251373760544769 | Bambi             | 2903 |
| 96378638261317632  | Robin             | 2355 |
| 149835181149257728 | Pippin            | 2501 |
| 228968038391611392 | neevz;.;          | 2500 |
| 237211379935739905 | zarwil            | 2500 |
| 209047905909080065 | Samev             | 2475 |
+--------------------+-------------------+------+
| 96293765001519104  | Petter            | 2771 |
| 259495471452520450 | PARaflaXet        | 2675 |
| 150517088295976960 | CATKNIFE          | 2547 |
| 96941150824329216  | Von Dobblen       | 2521 |
| 252531109491900417 | Banza1            | 2452 |
| 96306231043432448  | Lacktjo           | 2277 |
+--------------------+-------------------+------+
*/

+--------------------+-------------------+------+
| uid                | userName          | mmr  |
+--------------------+-------------------+------+
| 149244631010377728 | Knas              | 2725 |
| 107882667894124544 | Obtained          | 2675 |
| 97026023387848704  | Cheesedad         | 2600 |
| 224233137775837184 | Krossen           | 2600 |
| 150517088295976960 | CATKNIFE          | 2475 |
+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2650 |
| 96293765001519104  | Petter            | 2625 |
| 118012070049349632 | Jotunheim         | 2550 |
| 218695120848027648 | Marsche           | 2550 |
| 231097610113384448 | Pigeons           | 2525 |
| 96306231043432448  | Lacktjo           | 2500 |
| 96324164301910016  | Simon             | 2450 |
| 252531109491900417 | Banza1            | 2325 |
| 175001994321330177 | Gaggg             | 2225 |
| 356184240859250698 | ErjanDaMan        | 2225 |
+--------------------+-------------------+------+


/*

*/


/* New rating */ 
| 107205764044599296 | Xavantex          | 2675 |
| 218695120848027648 | Marsche           | 2575 |
| 231097610113384448 | Pigeons           | 2550 |
| 252531109491900417 | Banza1            | 2350 |
| 175001994321330177 | Gaggg             | 2250 |

| 96306231043432448  | Lacktjo           | 2500 |
| 96324164301910016  | Simon             | 2450 |
| 356184240859250698 | ErjanDaMan        | 2225 |
| 96293765001519104  | Petter            | 2625 |
| 118012070049349632 | Jotunheim         | 2550 |
+--------------------+-------------------+------+

/* Create player matches */
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (mid, uid, ?, +-25);
/*
OLD: INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
*/
/* Update rating */ 
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "107205764044599296", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "218695120848027648", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "231097610113384448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "252531109491900417", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "175001994321330177", 1, 25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "96306231043432448", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "96324164301910016", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "356184240859250698", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "96293765001519104", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (112, "118012070049349632", 2, -25);

UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 

| 107205764044599296 | Xavantex          | 2675 |
| 218695120848027648 | Marsche           | 2575 |
| 231097610113384448 | Pigeons           | 2550 |
| 252531109491900417 | Banza1            | 2350 |
| 175001994321330177 | Gaggg             | 2250 |

| 96306231043432448  | Lacktjo           | 2500 |
| 96324164301910016  | Simon             | 2450 |
| 356184240859250698 | ErjanDaMan        | 2225 |
| 96293765001519104  | Petter            | 2625 |
| 118012070049349632 | Jotunheim         | 2550 |
+--------------------+-------------------+------+

*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 


UPDATE ratings SET mmr = "2675", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "107205764044599296" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2575", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "218695120848027648" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "231097610113384448" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2350", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "252531109491900417" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2250", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "175001994321330177" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2500", gamesPlayed = gamesPlayed + 1 WHERE uid = "96306231043432448" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2450", gamesPlayed = gamesPlayed + 1 WHERE uid = "96324164301910016" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2225", gamesPlayed = gamesPlayed + 1 WHERE uid = "356184240859250698" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2625", gamesPlayed = gamesPlayed + 1 WHERE uid = "96293765001519104" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1 WHERE uid = "118012070049349632" AND gameName = "dota"; 
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
