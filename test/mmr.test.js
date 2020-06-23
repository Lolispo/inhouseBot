'use strict';
// Author: Petter Andersson

var assert = require('assert');
var rewire = require('rewire');

var fileModule = rewire('../src/game/mmr.js');

var eloUpdate = fileModule.__get__('eloUpdate');

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
		var result = eloUpdate(t1, t2, winner); // TODO Fix: requires to call a method that is public, eloUpdate is currently private
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
*/