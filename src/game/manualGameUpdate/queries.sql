SELECT mmrChange, users.userName FROM playerMatches LEFT JOIN users ON playerMatches.uid = users.uid 
LEFT JOIN matches ON matches.mid = playerMatches.mid 
WHERE gameName = "cs" AND userName = "robyn_fenty" ORDER BY matches.mid DE
SC;

UPDATE ratings SET mmr = "2600" WHERE uid = "228968038391611392" AND gameName = "cs"; 