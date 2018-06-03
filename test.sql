use pettea;

INSERT INTO ratings (uid, gameName, mmr, gamesPlayed, wins, losses) VALUES ((SELECT uid FROM users), 'cs', (SELECT cs FROM users), (SELECT gamesPlayed FROM users), 0, 0);

/*
CREATE TABLE game(
	gameName VARCHAR(64) NOT NULL,
	PRIMARY KEY (gameName)
);

INSERT INTO game (gameName) VALUES ('cs');
*/