	
/* Create match - get mid*/
INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW());
/*
OLD: INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("dota", "1", "5 Edgy Doggos", "4 Coconuts and confused Jimi", NOW(), NOW());
*/

INSERT INTO matches (gameName, result, team1Name, team2Name, createdAt, updatedAt) VALUES ("cs", "2", "The Spawn Camping Villians", "Petter's B-site Rushers", NOW(), NOW());

/*
  // Adjust faulty
  DELETE FROM matches WHERE mid = ?; 
  UPDATE matches SET mid = ? WHERE mid = ?;
*/

/* MID */
108
/* Players */


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

/*
The Spawn Camping Villians (CT)    (Avg: 2534.83 mmr):
Robin (2355), Bambi på hal is (2903), Pippin (2501), Samev (2500), neevz;.; (2500), zarwil (2450)
Petter's B-site Rushers (T)    (Avg: 2536.33 mmr): WINNER
Petter (2771), Lacktjo (2277), David E (2521), CATKNIFE (2522), Banza1 (2452), PARaflaXet (2675)

*/


/* New rating */ 
| 140251373760544769 | Bambi             | 2878 |
| 96378638261317632  | Robin             | 2330 |
| 149835181149257728 | Pippin            | 2476 |
| 228968038391611392 | neevz;.;          | 2475 |
| 237211379935739905 | zarwil            | 2475 |
| 209047905909080065 | Samev             | 2450 |
+--------------------+-------------------+------+
| 96293765001519104  | Petter            | 2796 |
| 259495471452520450 | PARaflaXet        | 2700 |
| 150517088295976960 | CATKNIFE          | 2572 |
| 96941150824329216  | Von Dobblen       | 2546 |
| 252531109491900417 | Banza1            | 2477 |
| 96306231043432448  | Lacktjo           | 2302 |

/* Create player matches */
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (mid, uid, ?, +-25);
/*
OLD: INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (91, "96306231043432448", 1, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
*/
/* Update rating */ 
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "140251373760544769", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96378638261317632", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "149835181149257728", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "228968038391611392", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "237211379935739905", 1, -25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "209047905909080065", 1, -25);

INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96293765001519104", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "259495471452520450", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "150517088295976960", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96941150824329216", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "252531109491900417", 2, 25);
INSERT INTO playerMatches (mid, uid, team, mmrChange) VALUES (108, "96306231043432448", 2, 25);

UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = ? AND gameName = ?; 
/*
OLD: UPDATE ratings SET mmr = "2550", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE userName = "Lacktjo" AND gameName = "dota"; 

| 140251373760544769 | Bambi             | 2878 |
| 96378638261317632  | Robin             | 2330 |
| 149835181149257728 | Pippin            | 2476 |
| 228968038391611392 | neevz;.;          | 2475 |
| 237211379935739905 | zarwil            | 2475 |
| 209047905909080065 | Samev             | 2450 |
+--------------------+-------------------+------+
| 96293765001519104  | Petter            | 2796 |
| 259495471452520450 | PARaflaXet        | 2700 |
| 150517088295976960 | CATKNIFE          | 2572 |
| 96941150824329216  | Von Dobblen       | 2546 |
| 252531109491900417 | Banza1            | 2477 |
| 96306231043432448  | Lacktjo           | 2302 |

*/
UPDATE ratings SET mmr = ?, gamesPlayed = gamesPlayed + 1 WHERE userName = ? AND gameName = ?; 


UPDATE ratings SET mmr = "2878", gamesPlayed = gamesPlayed + 1 WHERE uid = "140251373760544769" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2330", gamesPlayed = gamesPlayed + 1 WHERE uid = "96378638261317632" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2476", gamesPlayed = gamesPlayed + 1 WHERE uid = "149835181149257728" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1 WHERE uid = "228968038391611392" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2475", gamesPlayed = gamesPlayed + 1 WHERE uid = "237211379935739905" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2450", gamesPlayed = gamesPlayed + 1 WHERE uid = "209047905909080065" AND gameName = "cs"; 

UPDATE ratings SET mmr = "2796", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96293765001519104" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2700", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "259495471452520450" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2572", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "150517088295976960" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2546", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96941150824329216" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2477", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "252531109491900417" AND gameName = "cs"; 
UPDATE ratings SET mmr = "2302", gamesPlayed = gamesPlayed + 1, wins = wins + 1 WHERE uid = "96306231043432448" AND gameName = "cs"; 
/*
OLD: UPDATE ratings SET mmr = "2650", gamesPlayed = gamesPlayed + 1 WHERE userName = "Petter" AND gameName = "dota"; 
*/
