'use strict';
// Author: Petter Andersson

import { assert } from 'chai';
import { describe, it } from 'mocha';
const rewire = require('rewire');

const fileModule = rewire('../src/bot.js');
import { handleMessageExported, findPlayersStart } from '../src/bot';
const { getTextChannel } = require('../src/client');

// TODO
describe('bot', function(){
    describe('Test', function(){
        it('is 3*3 = 9?', function(){
            assert.equal(9, 3*3);
        });
    });
    describe('handleMessageExported', () => {
        it('handleMessageExported', () => {
            const messageObject = {
                ...getTextChannel(),
                author: { 
                    uid: '96293765001519104'
                },
                content: 'hej'
            }
            handleMessageExported(messageObject);
        });
    });
})

/**
 * 
// A Test for balancing and getting an active game without players available
function testBalanceGeneric(game, gameObject){
	console.log('\t<-- Testing Environment: 10 player game, res in console -->');
	const players = [];
	for (let i = 0; i < 10; i++){
		const tempPlayer = player_js.createPlayer('Player ' + i, i.toString());
		players.push(tempPlayer);
	}
	getModeAndPlayers(players, gameObject, { game }, options);
}
 */