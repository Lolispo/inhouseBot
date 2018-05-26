use pettea;

/* mysql --host=mysql-vt2016.csc.kth.se */

/* TODO:
	Add every game played to a table ALT get eBot working on server
*/


CREATE TABLE users(
	uid VARCHAR(64) NOT NULL,
	userName VARCHAR(64), 
	mmr int, 
	gamesPlayed int,
	PRIMARY KEY (uid)
);

/*
CREATE TABLE matches(
	mid int NOT NULL AUTO_INCREMENT,
	*//*Save all players playing and winning team*//* 
	PRIMARY KEY(mid)
);

*/

ALTER TABLE users ADD cs int;
ALTER TABLE users ADD cs1v1 int;
ALTER TABLE users ADD dota int;
ALTER TABLE users ADD dota1v1 int;

UPDATE users SET cs = mmr, cs1v1 = 2500, dota = 2500, dota1v1 = 2500;

ALTER TABLE users DROP mmr;


/*
INSERT INTO mmrs (uid, cs, cs1v1, dota, dota1v1) VALUES (x, (SELECT mmr FROM users WHERE uid = x), 2500, 2500, 2500)

SELECT * FROM users, mmrs;

CREATE TABLE mmrs(
	uid VARCHAR(64) NOT NULL,
	cs int,
	cs1v1 int,
	dota int,
	dota1v1 int,
	PRIMARY KEY (uid)
);

*/