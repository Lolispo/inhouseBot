'use strict;'

exports.eloupdate = function(t1mmr, t2mmr, winner){
	const K = 50;
	//transformed ratings for t1 and t2
	var t1_trans = Math.pow(10, t1mmr/400);
	var t2_trans = Math.pow(10, t2mmr/400);

	//estimated ratings for t1 and t2
	var est1 = t1_trans / (t1_trans+t2_trans);
	var est2 = t2_trans / (t1_trans+t2_trans);

	//actual score of winner
	var score1 = 0;
	var score2 = 0;

	switch(winner){
		case 1:
			score1 = 1;
			break;
		case 2:
			score2 = 1;
			break;
		default:
			//draw
			score1 = 0.5;
			score2 = 0.5;
	}

	//new mmr for t1 and t2
	var t1_new = t1mmr + K * (score1 - est1);
	var t2_new = t2mmr + K * (score2 - est2);

	return {
		t1: Math.round(t1_new)-t1mmr,
		t2: Math.round(t2_new)-t2mmr
	};
}

function tester(){
	var t1 = 2000;
	var t2 = 2400;
	var t1wins = 0;
	var draws = 0;
	var games = 10;

	for(var i = 0; i < games; i++){
	var winner = Math.floor((Math.random()*3));
	if(winner === 0){
		draws++;
	}else if(winner === 1){
		t1wins++;
	}
	var result = eloupdate(t1, t2, winner);
	var t1old = t1;
	var t2old = t2;
	t1 += result.t1;
	t2 += result.t2;
	console.log("Winner match", i, ": ", winner, "\n(t1old, t2old)=", t1old, ",", t2old,
	"\n(new)=",t1,",",t2, " diff(t1/t2)", result.t1, ",", result.t2,
	"\n###########");
	}
	console.log(
	"t1wins=", t1wins,
	", t2wins=", (games-t1wins),
	", draws=", draws);
}

//tester();
