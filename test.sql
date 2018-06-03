CREATE TABLE ratings(
	uid VARCHAR(64) NOT NULL,
	gameName VARCHAR(64) NOT NULL,
	mmr int,
	gamesPlayed int,
	wins int,
	losses int,  
	PRIMARY KEY (uid, gameName),
	FOREIGN KEY (uid) REFERENCES users(uid),
	FOREIGN KEY (gameName) REFERENCES game(gameName),
);