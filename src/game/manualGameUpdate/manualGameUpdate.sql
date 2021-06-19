	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
/*
SELECT mid, team1Name, team2Name FROM matches ORDER BY mid DESC LIMIT 5;


INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("cs", "2", "The Spawn Camping Villians", "Petter's B-site Rushers", NOW(), NOW());

INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "2", "5 Spawn Camping Lads", "Lucky Luke + 4 Pepegas", NOW(), NOW());


INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "The Confused Coconuts", "5 Tiny Ducks", NOW(), NOW());
*/

/*
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;
*/

/* MID */
SELECT * FROM matches ORDER BY mid DESC LIMIT 1;
157
/* Players */
/*
5 Spawn Camping Lads     (Avg: 2555.20 mmr):
Gaggg (2275), Cheesedad (2475), Lacktjo (2501), Knas (2749), Xavantex (2776)
Lucky Luke + 4 Pepegas     (Avg: 2555.20 mmr):
Lucky Luke (2375), David_ (2450), livaitan (2451), CATKNIFE (2601), Petter (2899)
*/
SELECT users.uid, users.userName, ratings.mmr FROM users LEFT JOIN ratings ON users.uid = ratings.uid WHERE gameName = "dota" ORDER BY mmr DESC;



+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2776 |
| 149244631010377728 | Knas              | 2749 |
| 96306231043432448  | Lacktjo           | 2501 |
| 97026023387848704  | Cheesedad         | 2475 |
| 175001994321330177 | Gaggg             | 2275 |
+--------------------+-------------------+------+
| 150517088295976960 | CATKNIFE          | 2601 |
| 96293765001519104  | Petter            | 2899 |
| 307653218031239168 | livaitan          | 2451 |
| 96941150824329216  | Von Dobblen       | 2450 |
| 151085266885410818 | Lucky Luke        | 2375 |
+--------------------+-------------------+------+



+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2751 |
| 149244631010377728 | Knas              | 2724 |
| 96306231043432448  | Lacktjo           | 2476 |
| 97026023387848704  | Cheesedad         | 2450 |
| 175001994321330177 | Gaggg             | 2250 |
+--------------------+-------------------+------+
| 150517088295976960 | CATKNIFE          | 2626 |
| 96293765001519104  | Petter            | 2924 |
| 307653218031239168 | livaitan          | 2476 |
| 96941150824329216  | Von Dobblen       | 2475 |
| 151085266885410818 | Lucky Luke        | 2400 |
+--------------------+-------------------+------+


/* Create player matches */
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (mid, uid, ?, +-25);
/*
OLD: INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
*/
/* Update rating */ 
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "107205764044599296", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "149244631010377728", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "96306231043432448", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "97026023387848704", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "175001994321330177", 1, -25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "150517088295976960", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "96293765001519104", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "307653218031239168", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "96941150824329216", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (157, "151085266885410818", 2, 25);


UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 


*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 


+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2751 |
| 149244631010377728 | Knas              | 2724 |
| 96306231043432448  | Lacktjo           | 2476 |
| 97026023387848704  | Cheesedad         | 2450 |
| 175001994321330177 | Gaggg             | 2250 |
+--------------------+-------------------+------+
| 150517088295976960 | CATKNIFE          | 2626 |
| 96293765001519104  | Petter            | 2924 |
| 307653218031239168 | livaitan          | 2476 |
| 96941150824329216  | Von Dobblen       | 2475 |
| 151085266885410818 | Lucky Luke        | 2400 |
+--------------------+-------------------+------+

UPDATE ratings SET mmr = "2751", gamesPlayed = gamesPlayed + 1 WHERE uid = "107205764044599296" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2724", gamesPlayed = gamesPlayed + 1 WHERE uid = "149244631010377728" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2476", gamesPlayed = gamesPlayed + 1 WHERE uid = "96306231043432448" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2450", gamesPlayed = gamesPlayed + 1 WHERE uid = "97026023387848704" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2250", gamesPlayed = gamesPlayed + 1 WHERE uid = "175001994321330177" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2626", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "150517088295976960" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2924", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96293765001519104" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2476", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "307653218031239168" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96941150824329216" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2400", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "151085266885410818" AND gameName = "dota"; 
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
