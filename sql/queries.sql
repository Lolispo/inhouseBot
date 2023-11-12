/* Get data for Season Reset queries */
SELECT uid, gameName, userName, mmr FROM ratings WHERE gameName = "dota" OR gameName = "cs" AND mmr != 2500;

SELECT uid, gameName, userName, mmr FROM ratings WHERE gameName != "trivia" AND mmr != 2500 ORDER BY gameName, mmr DESC;
/*
Old 
SELECT JSONARRAYAGG(JSON_OBJECT('uid', 'gameName', 'userName', 'mmr')) FROM ratings WHERE gameName = "dota" OR gameName = "cs" AND mmr != 2500;
SELECT JSON_OBJECT('uid', uid, 'gameName', gameName, 'userName', userName, 'mmr', mmr) FROM ratings WHERE gameName = "dota" OR gameName = "cs" AND mmr != 2500;
*/











/* Create read only user - Ran from the server*/
/* https://medium.com/@nkaurelien/how-to-create-a-read-only-mysql-user-226e8e49a855 */
CREATE USER 'read-only-user'@'%' IDENTIFIED BY '$pw';
GRANT SELECT, SHOW VIEW ON database1.* TO 'read-only-user'@'%' IDENTIFIED BY '$pw';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'read-only-user'@'%';

/* Queries */ 
SELECT mmrChange, users.userName FROM playerMatches LEFT JOIN users ON playerMatches.uid = users.uid 
LEFT JOIN matches ON matches.mid = playerMatches.mid 
WHERE gameName = "cs" AND userName = "CATKNIFE" ORDER BY matches.mid DESC;

UPDATE ratings SET mmr = "2600" WHERE uid = "228968038391611392" AND gameName = "cs"; 

SELECT userName, SUM(headshot_kills), SUM(kills), SUM(damage)/SUM(roundsPlayed) as ADR,(SUM(headshot_kills) / SUM(kills)) as HSPerc FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.uid GROUP BY CSPlayerStats.uid ORDER BY ADR DESC;

SELECT userName, SUM(headshot_kills), MAX(kills), SUM(damage)/SUM(roundsPlayed) as ADR,(SUM(headshot_kills) / SUM(kills)) as HSPerc FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.uid GROUP BY CSPlayerStats.uid ORDER BY MAX(kills) DESC;

 SELECT * FROM matches LEFT JOIN mid ON CSPlayerStats.mid = matches.mid WHERE mid = 40;

 SELECT userName, SUM(5kill_rounds) FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.uid WHERE 5kill_rounds > 0 GROUP BY users.uid ORDER BY SUM(5kill_rounds) DESC;

  SELECT userName, 5kill_rounds, createdAt FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.ui
  
  SELECT mmrChange, matches.mid, createdAt FROM playerMatches LEFT JOIN matches ON playerMatches.mid = matches.mid WHERE uid = "135406982977814528" ORDER BY mid ASC;


/* UPDATE users SET steamId="STEAM_0:1:8789399" WHERE uid="229348543402344450"; */