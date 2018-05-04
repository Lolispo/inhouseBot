use pettea;

/* mysql --host=mysql-vt2016.csc.kth.se */

create table users(
	uid int NOT NULL,
	userName VARCHAR(64), 
	mmr int, 
	PRIMARY KEY (uid)
);