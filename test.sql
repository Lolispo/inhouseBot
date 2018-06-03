use pettea;

INSERT INTO ratings (uid, gameName, mmr, gamesPlayed, wins, losses) VALUES ((SELECT uid FROM users where userName = 'Petter'), 'cs', (SELECT cs FROM users where userName = 'Petter'), (SELECT gamesPlayed FROM users where userName = 'Petter'), 0, 0);

/*
CREATE TABLE game(
	gameName VARCHAR(64) NOT NULL,
	PRIMARY KEY (gameName)
);

INSERT INTO game (gameName) VALUES ('cs');
*/