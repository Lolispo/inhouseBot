/* use pettea; // TODO Read name from env variable: process.env.DB_NAME */

/*
	Author: Petter Andersson
	Clear database entries 
*/

/* DELETE FROM users; */

/*UPDATE users SET cs = mmr, cs1v1 = 2500, dota = 2500, dota1v1 = 2500, trivia = 0;*/
/*UPDATE users SET cs = 2500, cs1v1 = 2500, dota = 2500, dota1v1 = 2500, trivia = 0, gamesPlayed = 0;*/

UPDATE users SET cs = 2500, gamesPlayed = 0;
/* Remove irrelavant discord users from default standings*/
UPDATE users SET cs = 1500 WHERE userName = "Rhytm";
UPDATE users SET cs = 1500 WHERE userName = "Player 0";
UPDATE users SET cs = 1500 WHERE userName = "Player 1";
UPDATE users SET cs = 1500 WHERE userName = "Player 2";
UPDATE users SET cs = 1500 WHERE userName = "Player 3";
UPDATE users SET cs = 1500 WHERE userName = "Player 4";
UPDATE users SET cs = 1500 WHERE userName = "Player 5";
UPDATE users SET cs = 1500 WHERE userName = "Player 6";
UPDATE users SET cs = 1500 WHERE userName = "Player 7";
UPDATE users SET cs = 1500 WHERE userName = "Player 8";
UPDATE users SET cs = 1500 WHERE userName = "Player 9";

/*
UPDATE ratings SET mmr = "2500" WHERE uid = "102482222484840448" AND gameName = "cs";
UPDATE ratings SET mmr = "2450" WHERE uid = "107205764044599296" AND gameName = "cs";
UPDATE ratings SET mmr = "2550" WHERE uid = "107205764044599296" AND gameName = "dota";
UPDATE ratings SET mmr = "2575" WHERE uid = "107882667894124544" AND gameName = "dota";
UPDATE ratings SET mmr = "2550" WHERE uid = "112632032172994560" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "117037153950760963" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "117376140506693639" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "117379657719873536" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "117458165192327173" AND gameName = "dota";
UPDATE ratings SET mmr = "2375" WHERE uid = "118012070049349632" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "123133242965491713" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "135406982977814528" AND gameName = "cs";
UPDATE ratings SET mmr = "2450" WHERE uid = "135406982977814528" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "137164019696926720" AND gameName = "cs";
UPDATE ratings SET mmr = "2675" WHERE uid = "140251373760544769" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "140251373760544769" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "140499807780208640" AND gameName = "cs";
UPDATE ratings SET mmr = "2525" WHERE uid = "140573553014603776" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "147347586561474560" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "148170397592977408" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "148603525411110913" AND gameName = "cs";
UPDATE ratings SET mmr = "2550" WHERE uid = "149244631010377728" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "149535388434694144" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "149592477647503360" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "149633205253701632" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "149835181149257728" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "149835181149257728" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "150517088295976960" AND gameName = "cs";
UPDATE ratings SET mmr = "2650" WHERE uid = "150517088295976960" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "150875839691620352" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "151085266885410818" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "151808935379206144" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "155376673825488896" AND gameName = "cs";
UPDATE ratings SET mmr = "2650" WHERE uid = "157967049694380032" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "158286828355452929" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "161153533931028480" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "161167781440651264" AND gameName = "cs";
UPDATE ratings SET mmr = "2625" WHERE uid = "164405269810380800" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "165252855966466048" AND gameName = "dota";
UPDATE ratings SET mmr = "2600" WHERE uid = "168075770558808064" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "170503347332317184" AND gameName = "dota";
UPDATE ratings SET mmr = "2350" WHERE uid = "175001994321330177" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "177492721244569601" AND gameName = "cs";
UPDATE ratings SET mmr = "2525" WHERE uid = "182196211590103041" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "182238869054423040" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "184760320441581568" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "187470635356651521" AND gameName = "dota";
UPDATE ratings SET mmr = "2625" WHERE uid = "192689639725858816" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "206103901747937280" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "207847340864700416" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "209047905909080065" AND gameName = "cs";
UPDATE ratings SET mmr = "2425" WHERE uid = "209047905909080065" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "211940617071099904" AND gameName = "cs";
UPDATE ratings SET mmr = "2450" WHERE uid = "211946324952743936" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "211946324952743936" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "213820305523736578" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "217772242329796609" AND gameName = "cs";
UPDATE ratings SET mmr = "2525" WHERE uid = "218695120848027648" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "220252177313169419" AND gameName = "dota";
UPDATE ratings SET mmr = "2450" WHERE uid = "223172323128115201" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "223172323128115201" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "224233137775837184" AND gameName = "cs";
UPDATE ratings SET mmr = "2550" WHERE uid = "224233137775837184" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "224296424429453315" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "228938002787729408" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "228968038391611392" AND gameName = "cs";
UPDATE ratings SET mmr = "2525" WHERE uid = "231097610113384448" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "232228778527424513" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "234331887252930560" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "234395307759108106" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "237211379935739905" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "244516400767565825" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "244822854187614228" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "252531109491900417" AND gameName = "cs";
UPDATE ratings SET mmr = "2475" WHERE uid = "252531109491900417" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "255783380908507136" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "259017565085499393" AND gameName = "cs";
UPDATE ratings SET mmr = "2625" WHERE uid = "259495471452520450" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "259495471452520450" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "276734532659576833" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "302050690459500556" AND gameName = "cs";
UPDATE ratings SET mmr = "2450" WHERE uid = "302050690459500556" AND gameName = "dota";
UPDATE ratings SET mmr = "2450" WHERE uid = "307653218031239168" AND gameName = "cs";
UPDATE ratings SET mmr = "2525" WHERE uid = "307653218031239168" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "323014287687811072" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "356184240859250698" AND gameName = "cs";
UPDATE ratings SET mmr = "2350" WHERE uid = "356184240859250698" AND gameName = "dota";
UPDATE ratings SET mmr = "2525" WHERE uid = "418797956062380032" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "511575971489382415" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "578285553779212289" AND gameName = "cs";
UPDATE ratings SET mmr = "2500" WHERE uid = "589240094267801614" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "85064872496205824" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "86198037843566592" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "91603481760104448" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "95575523429711872" AND gameName = "dota";
UPDATE ratings SET mmr = "2575" WHERE uid = "96272337585831936" AND gameName = "dota";
UPDATE ratings SET mmr = "2625" WHERE uid = "96293765001519104" AND gameName = "cs";
UPDATE ratings SET mmr = "2775" WHERE uid = "96293765001519104" AND gameName = "dota";
UPDATE ratings SET mmr = "2425" WHERE uid = "96306231043432448" AND gameName = "cs";
UPDATE ratings SET mmr = "2400" WHERE uid = "96306231043432448" AND gameName = "dota";
UPDATE ratings SET mmr = "2450" WHERE uid = "96324164301910016" AND gameName = "cs";
UPDATE ratings SET mmr = "2425" WHERE uid = "96324164301910016" AND gameName = "dota";
UPDATE ratings SET mmr = "2425" WHERE uid = "96378638261317632" AND gameName = "cs";
UPDATE ratings SET mmr = "2350" WHERE uid = "96378638261317632" AND gameName = "dota";
UPDATE ratings SET mmr = "2475" WHERE uid = "96647921574891520" AND gameName = "dota";
UPDATE ratings SET mmr = "2500" WHERE uid = "96941150824329216" AND gameName = "cs";
UPDATE ratings SET mmr = "2525" WHERE uid = "96941150824329216" AND gameName = "dota";
UPDATE ratings SET mmr = "2450" WHERE uid = "97026023387848704" AND gameName = "dota";
*/