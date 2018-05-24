use pettea;

/* mysql --host=mysql-vt2016.csc.kth.se */

/* TODO:
	Add every game played to a table
*/


create table users(
	uid VARCHAR(64) NOT NULL,
	userName VARCHAR(64), 
	mmr int, 
	gamesPlayed int,
	PRIMARY KEY (uid)
);

create table matches(
	mid int NOT NULL AUTO_INCREMENT,
	/* Save all players playing and winning team */
	PRIMARY KEY(mid)
);