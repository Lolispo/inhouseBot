	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
/*
SELECT mid, team1Name, team2Name FROM matches ORDER BY mid DESC LIMIT 5;

INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "5 Adorable Alpacas", "5 Edgy Pool Noodles", NOW(), NOW());
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("cs", "2", "The Spawn Camping Villians", "Petter's B-site Rushers", NOW(), NOW());

*/

/*
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;
*/

/* MID */
SELECT * FROM matches ORDER BY mid DESC LIMIT 1;
200
/* Players */
/*
New Game! Playing dota. MMR Avg diff: 4.60 mmr (Total: 23 mmr)
5 Adorable Alpacas     (Avg: 2589.90 mmr):
Petter (2899), Coof (2625), Dr.Albin (2525), Aios (2500), Cheesedad (2500)
5 Edgy Pool Noodles     (Avg: 2585.30 mmr):
Knas (2849), CATKNIFE (2626), Pippin (2625), Simon (2475), Lacktjo (2426)


*/
SELECT users.uid, users.userName, ratings.mmr FROM users LEFT JOIN ratings ON users.uid = ratings.uid WHERE gameName = "dota" ORDER BY mmr DESC;



| 96293765001519104  | Petter            | 2899 |
| 192689639725858816 | Coof              | 2625 |
| 165252855966466048 | Dr.Albin          | 2525 |
| 97026023387848704  | Cheesedad         | 2500 |
| 135406982977814528 | Aios              | 2500 |

| 149244631010377728 | Knas              | 2849 |
| 150517088295976960 | CATKNIFE          | 2626 |
| 149835181149257728 | Pippin            | 2625 |
| 96324164301910016  | Simon             | 2475 |
| 96306231043432448  | Lacktjo           | 2426 |




| 96293765001519104  | Petter            | 2924 |
| 192689639725858816 | Coof              | 2650 |
| 165252855966466048 | Dr.Albin          | 2550 |
| 97026023387848704  | Cheesedad         | 2525 |
| 135406982977814528 | Aios              | 2525 |

| 149244631010377728 | Knas              | 2824 |
| 150517088295976960 | CATKNIFE          | 2601 |
| 149835181149257728 | Pippin            | 2600 |
| 96324164301910016  | Simon             | 2450 |
| 96306231043432448  | Lacktjo           | 2401 |


/* Create player matches */
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (mid, uid, ?, +-25);
/*
OLD: INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
*/
/* Update rating */ 
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "96293765001519104", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "192689639725858816", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "165252855966466048", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "97026023387848704", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "135406982977814528", 1, 25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "149244631010377728", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "150517088295976960", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "149835181149257728", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "96324164301910016", 2, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (200, "96306231043432448", 2, -25);

/*
DELETE FROM playerMatches WHERE mid = 180;
*/

UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 


*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 


+--------------------+-------------------+------+
| 96293765001519104  | Petter            | 2924 |
| 192689639725858816 | Coof              | 2650 |
| 165252855966466048 | Dr.Albin          | 2550 |
| 97026023387848704  | Cheesedad         | 2525 |
| 135406982977814528 | Aios              | 2525 |

| 149244631010377728 | Knas              | 2824 |
| 150517088295976960 | CATKNIFE          | 2601 |
| 149835181149257728 | Pippin            | 2600 |
| 96324164301910016  | Simon             | 2450 |
| 96306231043432448  | Lacktjo           | 2401 |
+--------------------+-------------------+------+

UPDATE ratings SET mmr = "2751", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "107205764044599296" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2724", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96272337585831936" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2476", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96941150824329216" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2450", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "209047905909080065" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2250", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "150517088295976960" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2626", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "149244631010377728" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2924", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96293765001519104" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2476", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "307653218031239168" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "356184240859250698" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2400", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96378638261317632" AND gameName = "dota"; 

/*
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
