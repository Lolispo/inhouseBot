'use strict';
// Author: Petter Andersson

import { afterAll, describe, expect, it } from '@jest/globals';
import { getClientReference } from '../src/client';
import { handleMessageExported } from '../src/bot';
import { getClient, getTextChannel } from '../src/client';

// TODO
describe('bot', function(){
  describe('Test', function(){
    it('is 3*3 = 9?', function(){
      expect(9).toEqual(3*3);
    });
  });
  describe.skip('handleMessageExported', () => {
    // it('handleMessageExported', () => {
    //   const messageObject = {
    //     ...getTextChannel(),
    //     author: { 
    //         uid: '96293765001519104'
    //     },
    //     content: 'hej'
    //   }
    //   handleMessageExported(messageObject);
    // });
  });
  afterAll(() => {
    getClientReference().destroy();
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