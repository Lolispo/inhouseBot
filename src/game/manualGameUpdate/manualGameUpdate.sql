	
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
The Edgy Spicy Meatballs won! Played game: dota. Updated mmr is: 
4 Idiots and confused Samev: 
    Xavantex (2651 mmr, 2676 -25)
    CATKNIFE (2601 mmr, 2626 -25)
    Siimon (2526 mmr, 2551 -25)
    David_ (2450 mmr, 2475 -25)
    Samev (2324 mmr, 2349 -25)
The Edgy Spicy Meatballs: 
    Petter (2924 mmr, 2899 +25)
    Knas (2874 mmr, 2849 +25)
    livaitan (2601 mmr, 2576 +25)
    Robin (2250 mmr, 2225 +25)
    Jimi (2250 mmr, 2225 +25)
The Edgy Spicy Meatballs won! Played game: dota. Updated mmr is: 

REVERT THIS!!!!
4 Idiots and confused Samev: 
    Xavantex (2626 mmr, 2651 -25)
    CATKNIFE (2576 mmr, 2601 -25)
    Siimon (2501 mmr, 2526 -25)
    David_ (2425 mmr, 2450 -25)
    Samev (2299 mmr, 2324 -25)
The Edgy Spicy Meatballs: 
    Petter (2949 mmr, 2924 +25)
    Knas (2899 mmr, 2874 +25)
    livaitan (2626 mmr, 2601 +25)
    Robin (2275 mmr, 2250 +25)
    Jimi (2275 mmr, 2250 +25)
MATCHID: 180

    @MATCHFINISHED { whoWon: 'Dire', matchid: 6049611222 }
@MATCH FINISHED GAMEID: 855888058045825095

@MATCHFINISHED { whoWon: 'Dire', matchid: 6049611222 }
@MATCH FINISHED GAMEID: 855888058045825095


*/
SELECT users.uid, users.userName, ratings.mmr FROM users LEFT JOIN ratings ON users.uid = ratings.uid WHERE gameName = "dota" ORDER BY mmr DESC;




+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2626 |
| 96272337585831936  | Spoder            | 2551 |
| 96941150824329216  | Von Dobblen       | 2425 |
| 209047905909080065 | Samev             | 2299 |
| 150517088295976960 | CATKNIFE          | 2626 |
+--------------------+-------------------+------+
| 149244631010377728 | Knas              | 2849 |
| 96293765001519104  | Petter            | 2949 |
| 307653218031239168 | livaitan          | 2626 |
| 356184240859250698 | ErjanDaMan        | 2250 |
| 96378638261317632  | Robin             | 2225 |
+--------------------+-------------------+------+

+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2651 |
| 96272337585831936  | Spoder            | 2576 |
| 96941150824329216  | Von Dobblen       | 2450 |
| 209047905909080065 | Samev             | 2324 |
| 150517088295976960 | CATKNIFE          | 2651 |
+--------------------+-------------------+------+
| 149244631010377728 | Knas              | 2824 |
| 96293765001519104  | Petter            | 2924 |
| 307653218031239168 | livaitan          | 2601 |
| 356184240859250698 | ErjanDaMan        | 2225 |
| 96378638261317632  | Robin             | 2200 |
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

/*
DELETE FROM playerMatches WHERE mid = 180;
*/

UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 


*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 


+--------------------+-------------------+------+
| 107205764044599296 | Xavantex          | 2651 |
| 96272337585831936  | Spoder            | 2576 |
| 96941150824329216  | Von Dobblen       | 2450 |
| 209047905909080065 | Samev             | 2324 |
| 150517088295976960 | CATKNIFE          | 2651 |
+--------------------+-------------------+------+
| 149244631010377728 | Knas              | 2824 |
| 96293765001519104  | Petter            | 2924 |
| 307653218031239168 | livaitan          | 2601 |
| 356184240859250698 | ErjanDaMan        | 2225 |
| 96378638261317632  | Robin             | 2200 |
+--------------------+-------------------+------+

UPDATE ratings SET mmr = "2751", gamesPlayed = gamesPlayed + 1 WHERE uid = "107205764044599296" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2724", gamesPlayed = gamesPlayed + 1 WHERE uid = "96272337585831936" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2476", gamesPlayed = gamesPlayed + 1 WHERE uid = "96941150824329216" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2450", gamesPlayed = gamesPlayed + 1 WHERE uid = "209047905909080065" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2250", gamesPlayed = gamesPlayed + 1 WHERE uid = "150517088295976960" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2626", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "149244631010377728" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2924", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96293765001519104" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2476", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "307653218031239168" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "356184240859250698" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2400", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96378638261317632" AND gameName = "dota"; 


UPDATE ratings SET mmr = "2651", gamesPlayed = gamesPlayed - 1 WHERE uid = "107205764044599296" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2576", gamesPlayed = gamesPlayed - 1 WHERE uid = "96272337585831936" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2450", gamesPlayed = gamesPlayed - 1 WHERE uid = "96941150824329216" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2324", gamesPlayed = gamesPlayed - 1 WHERE uid = "209047905909080065" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2651", gamesPlayed = gamesPlayed - 1 WHERE uid = "150517088295976960" AND gameName = "dota"; 

UPDATE ratings SET mmr = "2824", gamesPlayed = gamesPlayed - 1, wins = wins - 1 WHERE uid = "149244631010377728" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2924", gamesPlayed = gamesPlayed - 1, wins = wins - 1 WHERE uid = "96293765001519104" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2601", gamesPlayed = gamesPlayed - 1, wins = wins - 1 WHERE uid = "307653218031239168" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2225", gamesPlayed = gamesPlayed - 1, wins = wins - 1 WHERE uid = "356184240859250698" AND gameName = "dota"; 
UPDATE ratings SET mmr = "2200", gamesPlayed = gamesPlayed - 1, wins = wins - 1 WHERE uid = "96378638261317632" AND gameName = "dota"; 
/*
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
