'use strict';
// Author: Petter Andersson

import { describe, it} from 'mocha';
const rewire = require('rewire');

const fileModule = rewire('../src/game/mmr.js');

const eloUpdate = fileModule.__get__('eloUpdate');

describe('mmr', function(){
	describe('eloupdate', function(){
		it('gives correct eloupdate on team1 win', function(){
			// TODO
		});
	});
})

/*
// TODO: Rewrite old unit_test to mocha test
function eloUpdate_test(){ 
	const t1 = 2000;
	const t2 = 2400;
	const t1wins = 0;
	const draws = 0;
	const games = 10;

	for (let i = 0; i < games; i++){
		const winner = Math.floor((Math.random()*3));
		if(winner === 0){
			draws++;
		}else if(winner === 1){
			t1wins++;
		}
		const result = eloUpdate(t1, t2, winner); // TODO Fix: requires to call a method that is public, eloUpdate is currently private
		const t1old = t1;
		const t2old = t2;
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
*/