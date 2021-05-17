	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "5 Edgy Doggos", "4 Coconuts and confused Jimi", NOW(), NOW());
/* 
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;
*/

/* MID */
91

/* Players */

Lacktjo 2525
Bambi 2425
Knas 2575
Catknife 2475
Marsche 2525
- 
Petter 2675
Simon 2450
Jotunheim 2550
Casper 2500
Jimi 2350

/* New rating */ 
Lacktjo 2550
Bambi 2450
Knas 2600
Catknife 2500
Marsche 2550
- 
Petter 2650
Simon 2425
Jotunheim 2525
Casper 2475
Jimi 2325

/* Create player matches */

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "140251373760544769", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "149244631010377728", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "150517088295976960", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "218695120848027648", 1, 25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96293765001519104", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96324164301910016", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "118012070049349632", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "302050690459500556", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "356184240859250698", 2, -25);

/* Update rating */ 

UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 

UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2450", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Bambi" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2600", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Knas" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2500", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Catknife" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Marsche" AND gameName = "dota"; 


UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2425", gamesPlayed = gamesPlayed + 1 WHERE userName = "Simon" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2525", gamesPlayed = gamesPlayed + 1 WHERE userName = "Jotunheim" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1 WHERE userName = "Casper" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2325", gamesPlayed = gamesPlayed + 1 WHERE userName = "ErjanDaMan" AND gameName = "dota"; 

