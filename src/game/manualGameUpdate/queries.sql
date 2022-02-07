SELECT mmrChange, users.userName FROM playerMatches LEFT JOIN users ON playerMatches.uid = users.uid 
LEFT JOIN matches ON matches.mid = playerMatches.mid 
WHERE gameName = "cs" AND userName = "robyn_fenty" ORDER BY matches.mid DE
SC;

UPDATE ratings SET mmr = "2600" WHERE uid = "228968038391611392" AND gameName = "cs"; 

SELECT userName, SUM(headshot_kills), SUM(kills), SUM(damage)/SUM(roundsPlayed) as ADR,(SUM(headshot_kills) / SUM(kills)) as HSPerc FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.uid GROUP BY CSPlayerStats.uid ORDER BY ADR DESC;

SELECT userName, SUM(headshot_kills), MAX(kills), SUM(damage)/SUM(roundsPlayed) as ADR,(SUM(headshot_kills) / SUM(kills)) as HSPerc FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.uid GROUP BY CSPlayerStats.uid ORDER BY MAX(kills) DESC;

 SELECT * FROM matches LEFT JOIN mid ON CSPlayerStats.mid = matches.mid WHERE mid = 40;

 SELECT userName, SUM(5kill_rounds) FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.uid WHERE 5kill_rounds > 0 GROUP BY users.uid ORDER BY SUM(5kill_rounds) DESC;

  SELECT userName, 5kill_rounds, createdAt FROM CSPlayerStats LEFT JOIN users ON users.uid = CSPlayerStats.ui
  
  SELECT mmrChange, matches.mid, createdAt FROM playerMatches LEFT JOIN matches ON playerMatches.mid = matches.mid WHERE uid = "135406982977814528" ORDER BY mid ASC;